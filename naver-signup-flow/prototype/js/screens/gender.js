// 05 성별: 드롭다운 대신 큰 버튼 3개
import { segments } from '../components/choice.js';
import { genderLabel } from '../state.js';

export default {
  id: 'gender',
  step: 2,
  title: '성별을 선택해 주세요',

  render(ctx) {
    const options = Object.entries(genderLabel).map(([value, label]) => ({ value, label }));

    return {
      body: segments({
        label: '성별',
        value: ctx.state.gender,
        options,
        onChange: (v) => { ctx.state.gender = v; },
      }),
      primary: '다음',
      onNext: () => ctx.next('phone'),
    };
  },
};
