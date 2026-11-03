// 약관 체크: 전체 동의 박스와 항목 한 줄
import { h, icon } from '../dom.js';
import { icons } from '../icons.js';

export function allAgree({ title, desc, onToggle }) {
  let on = false;
  const mark = h('span', { class: 'icon' });
  const el = h('button', {
    type: 'button',
    class: 'all-agree',
    role: 'checkbox',
    'aria-checked': 'false',
    onclick: () => onToggle(!on),
  },
    mark,
    h('span', { class: 'all-text' },
      h('span', { class: 'all-title' }, title),
      h('span', { class: 'all-desc' }, desc)),
  );

  function set(value) {
    on = value;
    el.setAttribute('aria-checked', String(value));
    mark.innerHTML = value ? icons.circleOn : icons.circleOff;
  }
  set(false);
  return { el, set };
}

export function checkRow({ label, sub = false, onToggle, onView }) {
  let on = false;
  const btn = h('button', {
    type: 'button',
    class: 'check-btn',
    role: 'checkbox',
    'aria-checked': 'false',
    onclick: () => onToggle(!on),
  }, icon('check'), h('span', {}, label));

  const el = h('div', { class: `check-row${sub ? ' sub' : ''}` },
    btn,
    onView && h('button', { type: 'button', class: 'link', 'aria-label': `${label} 보기`, onclick: onView }, '보기'),
  );

  return {
    el,
    set(value) {
      on = value;
      btn.setAttribute('aria-checked', String(value));
    },
  };
}
