// 입력한 값 목록 + '수정' 링크 (정보 확인 화면 · 사용자 통제와 자유)
import { h } from '../dom.js';

export function summaryList(items) {
  return h('div', { class: 'summary' },
    items.map(({ label, value, onEdit }) =>
      h('div', { class: 'summary-item' },
        h('div', { class: 'summary-text' },
          h('span', { class: 'summary-label' }, label),
          h('span', { class: 'summary-value' }, value)),
        onEdit && h('button', { type: 'button', class: 'link', 'aria-label': `${label} 수정`, onclick: onEdit }, '수정'))));
}
