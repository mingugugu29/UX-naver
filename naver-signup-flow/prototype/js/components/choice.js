// 하나만 고르는 선택지: 설명이 있는 카드형, 짧은 버튼형
import { h } from '../dom.js';

function radioGroup({ label, value, options, className, build, onChange }) {
  const items = options.map((option) => {
    const el = build(option);
    el.dataset.value = option.value;
    el.setAttribute('role', 'radio');
    el.addEventListener('click', () => select(option.value));
    return el;
  });

  function select(v) {
    items.forEach((el) => {
      const on = el.dataset.value === v;
      el.setAttribute('aria-checked', String(on));
      el.tabIndex = on ? 0 : -1;
    });
    onChange(v);
  }

  // 화살표 키로 선택 이동
  const group = h('div', { class: className, role: 'radiogroup', 'aria-label': label }, items);
  group.addEventListener('keydown', (e) => {
    const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const i = items.findIndex((el) => el.getAttribute('aria-checked') === 'true');
    const nextEl = items[(i + dir + items.length) % items.length];
    select(nextEl.dataset.value);
    nextEl.focus();
  });

  items.forEach((el) => {
    const on = el.dataset.value === value;
    el.setAttribute('aria-checked', String(on));
    el.tabIndex = on ? 0 : -1;
  });
  return group;
}

export function choiceCards({ label, value, options, onChange }) {
  return radioGroup({
    label, value, options, onChange,
    className: 'choices',
    build: (o) => h('button', { type: 'button', class: 'choice' },
      h('span', { class: 'radio' }),
      h('span', { class: 'choice-text' },
        h('span', { class: 'choice-title' }, o.title, o.badge && h('span', { class: 'badge' }, o.badge)),
        o.desc.map((line) => h('span', { class: 'choice-desc' }, line)))),
  });
}

export function segments({ label, value, options, onChange }) {
  return radioGroup({
    label, value, options, onChange,
    className: 'segments',
    build: (o) => h('button', { type: 'button', class: 'seg' }, o.label),
  });
}
