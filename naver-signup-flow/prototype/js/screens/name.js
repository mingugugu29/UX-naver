// 03 이름
import { field } from '../components/field.js';
import { checkName } from '../validators.js';

export default {
  id: 'name',
  step: 2,
  title: '이름을 입력해 주세요',

  render(ctx) {
    const s = ctx.state;
    const input = field({
      id: 'name',
      label: '이름',
      value: s.name,
      autocomplete: 'name',
      onValue: (v) => {
        s.name = v.trim();
        update();
      },
    });

    function update(refresh = true) {
      const result = checkName(s.name);
      input.setStatus(result.error ? 'error' : result.ok ? 'success' : 'default', result.ok ? '' : result.msg);
      if (refresh) ctx.refresh();
    }
    update(false);

    return {
      body: input.el,
      primary: '다음',
      validate: () => ({ ok: checkName(s.name).ok, hint: '이름을 입력하면 다음으로 넘어갈 수 있어요' }),
      onNext: () => ctx.next('birth'),
    };
  },
};
