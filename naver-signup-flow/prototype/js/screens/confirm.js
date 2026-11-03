// 08 정보 확인: 확정 전 전체 요약, 항목별 '수정'
import { fullInfo } from './shared.js';

export default {
  id: 'confirm',
  step: 3,
  title: '입력한 정보가 맞는지 확인해 주세요',

  render(ctx) {
    return {
      sub: '틀린 항목은 "수정"을 눌러 바로 고칠 수 있어요',
      body: fullInfo(ctx, ['idType', 'name', 'birth', 'gender', 'phone']),
      primary: '다음',
      validate: () => ({ ok: ctx.state.verified, hint: '바뀐 휴대전화 번호를 다시 인증해 주세요' }),
      onNext: () => ctx.go('userId'),
    };
  },
};
