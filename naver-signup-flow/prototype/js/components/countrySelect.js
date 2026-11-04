// 국가 번호 선택: 입력창 앞에는 '+82 ⌄'만 짧게, 누르면 기기 기본 목록(나라 이름 + 번호)이 열림
import { h } from '../dom.js';

export function countrySelect({ countries, value, onChange }) {
  const shown = h('span', { class: 'country-code' });

  const select = h('select', {
    class: 'country-native',
    'aria-label': '국가 번호',
    onchange: () => {
      sync();
      onChange(select.value);
    },
  }, countries.map((c) => h('option', { value: c.code + '|' + c.name }, `${c.name} ${c.code}`)));

  const current = countries.find((c) => c.code === value.code && c.name === value.name) || countries[0];
  select.value = current.code + '|' + current.name;

  function sync() {
    shown.textContent = select.value.split('|')[0];
  }
  sync();

  return h('span', { class: 'country' }, shown, h('span', { class: 'country-caret', 'aria-hidden': 'true' }), select);
}
