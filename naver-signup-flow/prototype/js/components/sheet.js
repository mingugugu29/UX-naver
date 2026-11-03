// 아래에서 올라오는 바텀시트 (약관 요약 보기)
import { h, icon } from '../dom.js';

export function openSheet({ title, rows, note, actionLabel, onAction }) {
  const returnFocus = document.activeElement;

  function close() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    returnFocus?.focus?.();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  const action = h('button', {
    type: 'button',
    class: 'btn btn-primary',
    onclick: () => {
      onAction?.();
      close();
    },
  }, actionLabel);

  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sheet-title' },
    h('span', { class: 'sheet-handle', 'aria-hidden': 'true' }),
    h('div', { class: 'sheet-head' },
      h('h2', { id: 'sheet-title' }, title),
      h('button', { type: 'button', class: 'icon-btn', 'aria-label': '닫기', onclick: close }, icon('close'))),
    h('dl', { class: 'sheet-rows' }, rows.map(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])),
    note && h('p', { class: 'sheet-note' }, note),
    action,
  );

  const backdrop = h('div', {
    class: 'sheet-backdrop',
    onclick: (e) => {
      if (e.target === backdrop) close();
    },
  }, sheet);

  document.body.append(backdrop);
  document.addEventListener('keydown', onKey);
  action.focus();
}
