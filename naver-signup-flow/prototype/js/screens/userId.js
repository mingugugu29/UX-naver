// 09 아이디: 입력하는 동안 사용 가능 여부 안내
import { field } from '../components/field.js';
import { checkUserId } from '../validators.js';

export default {
  id: 'userId',
  step: 4,
  title: '사용할 아이디를 만들어 주세요',

  render(ctx) {
    const s = ctx.state;
    const input = field({
      id: 'userId',
      label: '아이디',
      value: s.userId,
      autocomplete: 'username',
      maxlength: 21,
      format: (v) => v.toLowerCase().replace(/\s/g, ''),
      onValue: (v) => {
        s.userId = v;
        update();
      },
    });

    function update(refresh = true) {
      input.apply(checkUserId(s.userId));
      if (refresh) ctx.refresh();
    }
    update(false);

    return {
      sub: '이미 쓰이는 아이디 예시: admin, hong123',
      body: input.el,
      primary: '다음',
      validate: () => ({ ok: checkUserId(s.userId).ok, hint: '사용할 수 있는 아이디를 입력해 주세요' }),
      onNext: () => ctx.next('password'),
    };
  },
};
