// 11 패스키 안내: 다크 테마 통일, '다음에 할게요'로 쉽게 건너뛰기
import { h, icon } from '../dom.js';
import { notice } from '../components/notice.js';

export default {
  id: 'passkey',
  step: null,
  noBack: true, // 계정이 만들어진 뒤라 되돌아가지 않음
  title: '비밀번호 대신 패스키로\n1초 만에 로그인해 보세요',

  render(ctx) {
    const finish = (on) => {
      ctx.state.passkey = on;
      ctx.go('done');
    };

    return {
      sub: '휴대폰 잠금을 풀 때 쓰는 얼굴·지문으로 로그인하는 기능이에요.',
      body: [
        h('div', { class: 'illus' }, icon('key')),
        notice('info', '얼굴·지문 정보는 내 기기 밖으로 나가지 않아요. 체험용 화면이라 실제로 설정되지는 않아요.'),
      ],
      primary: '지금 패스키 설정하기',
      secondary: { label: '다음에 할게요', onClick: () => finish(false) },
      onNext: () => finish(true),
    };
  },
};
