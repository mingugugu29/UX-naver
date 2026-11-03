// 밑줄형 입력창: 상태(default · error · success)에 따라 밑줄, 아이콘, 안내 문구가 바뀜
import { h } from '../dom.js';
import { icons } from '../icons.js';

export function field({
  id,
  label,
  value = '',
  type = 'text',
  prefix,
  inputmode,
  maxlength,
  autocomplete = 'off',
  format,
  clearable = true,
  toggle = false,
  onValue,
}) {
  const input = h('input', {
    id,
    type,
    value,
    class: 'field-input',
    inputMode: inputmode,
    maxLength: maxlength,
    autocomplete,
    spellcheck: false,
    'aria-describedby': `${id}-help`,
  });

  const status = h('span', { class: 'field-status', 'aria-hidden': 'true' });
  const helper = h('p', { class: 'field-helper', id: `${id}-help`, hidden: true });

  const clear = clearable && h('button', {
    type: 'button',
    class: 'icon-btn',
    'aria-label': `${label} 지우기`,
    html: icons.clear,
    onclick: () => {
      input.value = '';
      emit();
      input.focus();
    },
  });

  const eye = toggle && h('button', {
    type: 'button',
    class: 'icon-btn',
    'aria-label': '비밀번호 보기',
    html: icons.eyeOff,
    onclick: () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.innerHTML = show ? icons.eye : icons.eyeOff;
      eye.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 보기');
    },
  });

  const el = h('div', { class: 'field', 'data-status': 'default' },
    h('label', { class: 'field-label', htmlFor: id }, label),
    h('div', { class: 'field-row' },
      prefix && h('span', { class: 'field-prefix' }, prefix),
      input, clear, status, eye),
    helper,
  );

  function syncClear() {
    if (clear) clear.hidden = !input.value || el.dataset.status === 'success' || input.disabled;
  }

  function emit() {
    if (format) input.value = format(input.value);
    syncClear();
    onValue?.(input.value);
  }

  input.addEventListener('input', emit);

  function setStatus(kind, msg) {
    el.dataset.status = kind;
    status.innerHTML = kind === 'success' ? icons.ok : kind === 'error' ? icons.err : '';
    helper.textContent = msg || '';
    helper.hidden = !msg;
    input.setAttribute('aria-invalid', String(kind === 'error'));
    syncClear();
  }

  /** 검사 결과({ ok, error, msg })를 그대로 화면 상태로 반영 */
  function apply(result) {
    setStatus(result.ok ? 'success' : result.error ? 'error' : 'default', result.msg);
  }

  syncClear();
  return { el, input, setStatus, apply };
}
