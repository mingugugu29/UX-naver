// 04 생년월일: 숫자만 쳐도 점 자동 입력, 올바르면 안내 문구 대신 ✓
import { field } from '../components/field.js';
import { checkBirth, digits, formatBirth } from '../validators.js';

export default {
  id: 'birth',
  step: 2,
  title: '생년월일을 입력해 주세요',

  render(ctx) {
    const s = ctx.state;
    const input = field({
      id: 'birth',
      label: '생년월일',
      value: formatBirth(s.birth),
      inputmode: 'numeric',
      maxlength: 10,
      autocomplete: 'bday',
      format: formatBirth,
      onValue: (v) => {
        s.birth = digits(v);
        update();
      },
    });

    function update(refresh = true) {
      input.apply(checkBirth(s.birth));
      if (refresh) ctx.refresh();
    }
    update(false);

    return {
      body: input.el,
      primary: '다음',
      validate: () => ({ ok: checkBirth(s.birth).ok, hint: '생년월일 8자리를 바르게 입력해 주세요' }),
      onNext: () => ctx.next('gender'),
    };
  },
};
