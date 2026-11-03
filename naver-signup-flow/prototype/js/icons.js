// 인라인 SVG 아이콘 (currentColor로 색을 따라감)
const svg = (inner, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${inner}</svg>`;

const tick = 'stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  back: svg(`<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" ${tick}/>`, 24),
  close: svg(`<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" ${tick}/>`, 22),
  check: svg(`<path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.2" ${tick}/>`, 22),
  checkSmall: svg(`<path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" ${tick}/>`, 16),
  circleOn: svg(`<circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.3l3.3 3.3L17 9" stroke="#1f1f1f" stroke-width="2.2" ${tick}/>`, 28),
  circleOff: svg(`<circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1.5"/><path d="M7 12.3l3.3 3.3L17 9" stroke="currentColor" stroke-width="2" ${tick}/>`, 28),
  clear: svg(`<circle cx="12" cy="12" r="10" fill="#8a8a8a"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#1f1f1f" stroke-width="1.8" stroke-linecap="round"/>`),
  ok: svg(`<circle cx="12" cy="12" r="10" fill="#67c664"/><path d="M7.5 12.2l3 3L16.5 9" stroke="#1f1f1f" stroke-width="2" ${tick}/>`),
  err: svg(`<circle cx="12" cy="12" r="10" fill="#e5604d"/><path d="M12 7v6" stroke="#1f1f1f" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.2" fill="#1f1f1f"/>`),
  eye: svg(`<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>`, 22),
  eyeOff: svg(`<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M4 4l16 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`, 22),
  info: svg(`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor"/>`, 18),
  warn: svg(`<circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 6.5v7" stroke="#1f1f1f" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.3" fill="#1f1f1f"/>`, 18),
  key: svg(`<circle cx="8" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M12 12h9M18 12v3M21 12v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`, 64),
  done: svg(`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" stroke-width="1.8" ${tick}/>`, 80),
};
