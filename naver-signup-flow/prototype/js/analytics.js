// 사용성 측정: 화면별로 머문 시간, 오류, 가입 완료까지 걸린 시간을 기록한다
// 입력한 값(이름, 번호 등)은 기록하지 않는다.
import { sendEvents, status } from './api.js';

const VARIANT = 'after'; // 개선안. 개선 전 흐름을 재현하면 'before'로 기록한다

let sessionId = null;
let startedAt = 0;
let currentScreen = null;
let screenStartedAt = 0;
let queue = [];

const now = () => performance.now();
const newId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);

export function flush() {
  if (!sessionId || !queue.length) return;
  if (status() === null) return; // 서버 확인 전이면 모아 두었다가 나중에 보낸다
  const events = queue;
  queue = [];
  sendEvents({ sessionId, variant: VARIANT, events });
}

export function track(type, data = {}) {
  if (!sessionId) return;
  queue.push({ type, ...data });
  if (queue.length >= 10) flush();
}

/** 새 체험 시작 (처음 열 때, '홈으로 이동'을 눌렀을 때) */
export function startSession() {
  flush();
  sessionId = newId();
  startedAt = now();
  currentScreen = null;
  track('session_start');
}

export function enterScreen(screen) {
  leaveScreen();
  currentScreen = screen;
  screenStartedAt = now();
  track('screen_view', { screen });
}

export function leaveScreen() {
  if (!currentScreen) return;
  track('screen_leave', { screen: currentScreen, durationMs: now() - screenStartedAt });
  currentScreen = null;
}

/** 입력창에 빨간 오류가 뜰 때 (어떤 칸에서 어떤 오류가 많은지 보기 위해) */
export function fieldError(label, message) {
  track('field_error', { screen: currentScreen, detail: `${label}: ${message}` });
}

/** 버튼을 눌렀는데 서버가 거절했을 때 (인증번호 불일치, 월 1회 초과 등) */
export function actionError(message) {
  track('action_error', { screen: currentScreen, detail: message });
}

export function complete() {
  leaveScreen();
  track('signup_complete', { durationMs: now() - startedAt });
  flush();
}

export const getSessionId = () => sessionId;

// 창을 닫거나 다른 탭으로 갈 때 남은 기록을 보내고, 돌아오면 시간을 다시 잰다
let pausedScreen = null;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    pausedScreen = currentScreen;
    leaveScreen();
    flush();
  } else if (pausedScreen && !currentScreen) {
    currentScreen = pausedScreen;
    screenStartedAt = now();
    pausedScreen = null;
  }
});
