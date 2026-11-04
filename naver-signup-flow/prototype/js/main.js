// 시작점
import { start, ctx } from './router.js';
import { connect, isDemoMode } from './api.js';
import { flush } from './analytics.js';

start();

document.getElementById('restart').addEventListener('click', () => ctx.restart());

// 서버 연결 확인 → 화면 아래에 상태 표시, 모아 둔 측정 기록 보내기
const badge = document.getElementById('server-status');
connect().then((online) => {
  if (badge) {
    badge.dataset.online = String(online);
    badge.textContent = online
      ? `서버 연결됨 · 사용성 측정 중${isDemoMode() ? ' · 체험 모드' : ''}`
      : '오프라인 체험 (서버 없이 화면만 동작)';
  }
  const statsLink = document.getElementById('stats-link');
  if (statsLink) statsLink.hidden = !online;
  flush();
});
