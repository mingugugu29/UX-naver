// 12 가입 완료: 완료 상태와 다음에 할 일을 분명하게
import { h, icon } from '../dom.js';
import { complete } from '../analytics.js';

export default {
  id: 'done',
  step: null,
  noBack: true,

  render(ctx) {
    const s = ctx.state;
    complete(); // 가입 완료까지 걸린 시간을 기록
    const next = s.idType === 'real'
      ? '결제·쇼핑·멤버십을 바로 쓸 수 있어요.'
      : '결제·쇼핑은 처음 쓸 때 본인 인증을 한 번 해 주세요.';

    return {
      center: true,
      title: `${s.userId}님,\n만나서 반가워요!`,
      sub: `가입이 끝났어요. ${next}${s.passkey ? ' 패스키도 설정했어요.' : ''}`,
      body: h('div', { class: 'done-mark' }, icon('done')),
      primary: '홈으로 이동',
      onNext: () => ctx.restart(),
    };
  },
};
