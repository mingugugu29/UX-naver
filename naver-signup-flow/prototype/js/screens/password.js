// 10 비밀번호: 조건별 실시간 체크리스트, 비밀번호 확인, 무엇이 부족한지 버튼 위에 안내
import { h, icon } from '../dom.js';
import { field } from '../components/field.js';
import { notice } from '../components/notice.js';
import { PASSWORD_RULES, passwordStrength, checkPasswordConfirm } from '../validators.js';
import { isOnline, signup } from '../api.js';
import { actionError, getSessionId } from '../analytics.js';

export default {
  id: 'password',
  step: 4,
  title: '비밀번호를 만들어 주세요',

  render(ctx) {
    const s = ctx.state;
    const rules = h('ul', { class: 'rules', 'aria-label': '비밀번호 조건' });
    const strength = h('p', { class: 'strength' });

    const passwordField = (id, label, key) => field({
      id,
      label,
      type: 'password',
      value: s[key],
      autocomplete: 'new-password',
      maxlength: 16,
      clearable: false,
      toggle: true,
      onValue: (v) => {
        s[key] = v;
        update();
      },
    });

    const input = passwordField('password', '비밀번호', 'password');
    const confirm = passwordField('passwordConfirm', '비밀번호 확인', 'passwordConfirm');

    function update(refresh = true) {
      rules.replaceChildren(...PASSWORD_RULES.map((rule) => {
        const met = rule.test(s.password);
        return h('li', { class: `rule${met ? ' met' : ''}` },
          icon('checkSmall'), rule.label,
          h('span', { class: 'sr-only' }, met ? ' 충족' : ' 미충족'));
      }));
      const level = passwordStrength(s.password);
      strength.replaceChildren('안전도 ', h('b', { class: level.tone }, level.label));
      confirm.apply(checkPasswordConfirm(s.password, s.passwordConfirm));
      if (refresh) ctx.refresh();
    }
    update(false);

    // 가입 저장이 거절됐을 때 안내 (예: 그사이 다른 사람이 같은 아이디로 가입)
    const saveError = h('div', { class: 'stack' });

    return {
      body: [
        h('div', { class: 'stack' }, input.el, rules, strength),
        confirm.el,
        saveError,
      ],
      primary: '가입 완료하기',
      validate: () => {
        const missing = PASSWORD_RULES.find((r) => !r.test(s.password));
        if (missing) return { ok: false, hint: `${missing.hint}. 그러면 가입할 수 있어요` };
        if (!checkPasswordConfirm(s.password, s.passwordConfirm).ok) {
          return { ok: false, hint: '비밀번호 확인 칸에 같은 비밀번호를 입력해 주세요' };
        }
        return { ok: true };
      },
      onNext: async () => {
        // 서버가 있으면 가입 정보를 저장한다 (비밀번호·이름·생년월일·전화번호는 보내지 않음)
        const r = isOnline()
          ? await signup({
            userId: s.userId,
            idType: s.idType,
            gender: s.gender,
            country: s.country.code,
            sessionId: getSessionId(),
          })
          : null;
        if (r && !r.ok) {
          actionError(r.message);
          saveError.replaceChildren(
            notice('error', `${r.message} 아이디를 바꾼 뒤 다시 시도해 주세요.`),
            h('button', { type: 'button', class: 'link', onclick: () => ctx.edit('userId') }, '아이디 바꾸기'),
          );
          return;
        }
        ctx.go('passkey');
      },
    };
  },
};
