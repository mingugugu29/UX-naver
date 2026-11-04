// 서버 API 호출
// 서버가 없으면(파일로 열었거나 Claude 링크로 볼 때) 각 함수가 null을 돌려주고,
// 화면은 지금까지처럼 브라우저 안에서만 동작한다.

const TIMEOUT_MS = 2500;
let online = null; // null: 아직 확인 전 / true: 서버 연결됨 / false: 서버 없음
let demoMode = false;

async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(path, {
      method,
      signal: controller.signal,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!(res.headers.get('content-type') || '').includes('application/json')) return null;
    return await res.json();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 서버가 켜져 있는지 한 번 확인 */
export const connect = async () => {
  if (location.protocol === 'file:') {
    online = false;
    return false;
  }
  const data = await request('/api/health');
  online = Boolean(data && data.ok);
  demoMode = Boolean(data && data.demoMode);
  return online;
};

export const status = () => online;
export const isOnline = () => online === true;
export const isDemoMode = () => demoMode;

/** 아이디 사용 가능 여부: { available, message } */
export const checkId = async (userId) =>
  isOnline() ? request(`/api/ids/check?userId=${encodeURIComponent(userId)}`) : null;

/** 인증번호 받기: { status: 'sent' | 'limit' | 'invalid', message, demoCode } */
export const sendCode = async (country, phone) =>
  isOnline() ? request('/api/verify/send', { method: 'POST', body: { country, phone } }) : null;

/** 인증번호 확인: { verified, message } */
export const confirmCode = async (country, phone, code) =>
  isOnline() ? request('/api/verify/confirm', { method: 'POST', body: { country, phone, code } }) : null;

/** 가입 저장: { ok, message } */
export const signup = async (payload) =>
  isOnline() ? request('/api/signup', { method: 'POST', body: payload }) : null;

/** 측정 기록 보내기 (페이지를 닫는 순간에도 전송되게 sendBeacon 사용) */
export function sendEvents(payload) {
  if (!isOnline()) return false;
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon && navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }))) {
    return true;
  }
  fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true })
    .catch(() => {});
  return true;
}
