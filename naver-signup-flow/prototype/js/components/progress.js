// 진행 단계 바 (가시성)
import { h } from '../dom.js';

export const STEPS = ['약관 동의', '본인 정보', '휴대폰 인증', '계정 만들기'];

export function progress(step) {
  return h('div', {
    class: 'progress',
    role: 'progressbar',
    'aria-valuemin': 1,
    'aria-valuemax': STEPS.length,
    'aria-valuenow': step,
    'aria-valuetext': `${STEPS.length}단계 중 ${step}단계, ${STEPS[step - 1]}`,
  },
    h('div', { class: 'progress-bars' },
      STEPS.map((_, i) => h('span', { class: `bar${i < step ? ' on' : ''}` }))),
    h('ol', { class: 'progress-labels', 'aria-hidden': 'true' },
      STEPS.map((label, i) => h('li', {
        class: i < step - 1 ? 'done' : i === step - 1 ? 'now' : '',
      }, `${i + 1}. ${label}`))),
  );
}
