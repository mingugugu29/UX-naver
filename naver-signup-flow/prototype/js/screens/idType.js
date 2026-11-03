// 02 아이디 유형 선택 (신규): 실명/일반 아이디 차이를 카드에서 바로 비교
import { choiceCards } from '../components/choice.js';
import { ID_TYPES } from './content.js';

export default {
  id: 'idType',
  step: 2,
  title: '어떤 아이디로 가입할까요?',

  render(ctx) {
    const cards = choiceCards({
      label: '아이디 유형',
      value: ctx.state.idType,
      options: ID_TYPES,
      onChange: (v) => { ctx.state.idType = v; },
    });

    return {
      sub: '결제·쇼핑을 바로 쓰려면 실명 인증 아이디를 골라 주세요',
      body: cards,
      primary: '다음',
      onNext: () => ctx.next('name'),
    };
  },
};
