// 06 휴대폰 인증 (발송 전): 월 1회 제한을 버튼 누르기 전에 안내
import { field } from '../components/field.js';
import { notice } from '../components/notice.js';
import { checkPhone, digits, formatPhone } from '../validators.js';

export default {
  id: 'phone',
  step: 3,
  title: '휴대전화 번호를 입력해 주세요',

  render(ctx) {
    const s = ctx.state;
    const alreadySent = s.sendCount > 0;

    const input = field({
      id: 'phone',
      label: '휴대전화 번호',
      prefix: '+82',
      value: formatPhone(s.phone),
      inputmode: 'tel',
      maxlength: 13,
      autocomplete: 'tel-national',
      format: formatPhone,
      onValue: (v) => {
        const d = digits(v);
        if (d !== s.phone) {
          s.phone = d;
          s.verified = false;
        }
        update();
      },
    });

    function update(refresh = true) {
      input.apply(checkPhone(s.phone));
      if (refresh) ctx.refresh();
    }
    update(false);

    const limit = alreadySent
      ? notice('warn', '이번 달에 이미 인증번호를 받았어요. 문자로 받은 번호를 그대로 입력해 주세요.')
      : notice('warn', '인증번호는 한 달에 1번만 받을 수 있어요. 번호가 맞는지 한 번 더 확인해 주세요.');

    return {
      body: [input.el, limit],
      primary: alreadySent ? '받은 인증번호 입력하기' : '인증번호 받기',
      validate: () => ({ ok: checkPhone(s.phone).ok, hint: '휴대전화 번호를 바르게 입력해 주세요' }),
      onNext: () => {
        if (!alreadySent) {
          s.sendCount = 1;
          s.sentAt = Date.now();
        }
        ctx.go('verify');
      },
    };
  },
};
