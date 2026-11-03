// 10 비밀번호: 조건별 실시간 체크리스트, 무엇이 부족한지 버튼 위에 안내
import { h, icon } from '../dom.js';
import { field } from '../components/field.js';
import { PASSWORD_RULES, passwordStrength } from '../validators.js';

export default {
  id: 'password',
  step: 4,
  title: '비밀번호를 만들어 주세요',

  render(ctx) {
    const s = ctx.state;
    const rules = h('ul', { class: 'rules', 'aria-label': '비밀번호 조건' });
    const strength = h('p', { class: 'strength' });

    const input = field({
      id: 'password',
      label: '비밀번호',
      type: 'password',
      value: s.password,
      autocomplete: 'new-password',
      maxlength: 16,
      clearable: false,
      toggle: true,
      onValue: (v) => {
        s.password = v;
        update();
      },
    });

    function update(refresh = true) {
      rules.replaceChildren(...PASSWORD_RULES.map((rule) => {
        const met = rule.test(s.password);
        return h('li', { class: `rule${met ? ' met' : ''}` },
          icon('checkSmall'), rule.label,
          h('span', { class: 'sr-only' }, met ? ' 충족' : ' 미충족'));
      }));
      const level = passwordStrength(s.password);
      strength.replaceChildren('안전도 ', h('b', { class: level.tone }, level.label));
      if (refresh) ctx.refresh();
    }
    update(false);

    return {
      body: [input.el, rules, strength],
      primary: '가입 완료하기',
      validate: () => {
        const missing = PASSWORD_RULES.find((r) => !r.test(s.password));
        return missing ? { ok: false, hint: `${missing.hint}. 그러면 가입할 수 있어요` } : { ok: true };
      },
      onNext: () => ctx.go('passkey'),
    };
  },
};
