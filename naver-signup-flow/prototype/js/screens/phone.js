// 06 휴대폰 인증 (발송 전): 국가 번호 선택, 월 1회 제한을 버튼 누르기 전에 안내
// 서버가 있으면 서버가 인증번호를 만들고 월 1회 제한을 직접 검사한다
import { field } from '../components/field.js';
import { notice } from '../components/notice.js';
import { countrySelect } from '../components/countrySelect.js';
import { checkPhone, digits, formatPhone } from '../validators.js';
import { isOnline, sendCode } from '../api.js';
import { actionError } from '../analytics.js';
import { COUNTRIES } from './content.js';

export default {
  id: 'phone',
  step: 3,
  title: '휴대전화 번호를 입력해 주세요',

  render(ctx) {
    const s = ctx.state;
    const alreadySent = s.sendCount > 0;
    const code = () => s.country.code;

    const country = countrySelect({
      countries: COUNTRIES,
      value: s.country,
      onChange: (v) => {
        const [c, name] = v.split('|');
        s.country = { code: c, name };
        s.verified = false;
        // 나라가 바뀌면 그 나라 형식으로 다시 맞춤
        input.input.value = formatPhone(s.phone, code());
        s.phone = digits(input.input.value);
        update();
        input.input.focus();
      },
    });

    const input = field({
      id: 'phone',
      label: '휴대전화 번호',
      prefix: country,
      value: formatPhone(s.phone, code()),
      inputmode: 'tel',
      maxlength: 15,
      autocomplete: 'tel-national',
      format: (v) => formatPhone(v, code()),
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
      input.apply(checkPhone(s.phone, code()));
      if (refresh) ctx.refresh();
    }
    update(false);

    const limit = alreadySent
      ? notice('warn', '이번 달에 이미 인증번호를 받았어요. 문자로 받은 번호를 그대로 입력해 주세요.')
      : notice('warn', '인증번호는 한 달에 1번만 받을 수 있어요. 번호가 맞는지 한 번 더 확인해 주세요.');

    function markSent(result, demoCode = null) {
      s.sendCount = 1;
      s.sentAt = Date.now();
      s.sendResult = result;
      s.demoCode = demoCode;
    }

    return {
      body: [input.el, limit],
      primary: alreadySent ? '받은 인증번호 입력하기' : '인증번호 받기',
      validate: () => ({ ok: checkPhone(s.phone, code()).ok, hint: '휴대전화 번호를 바르게 입력해 주세요' }),
      onNext: async () => {
        if (alreadySent) return ctx.go('verify');

        const r = isOnline() ? await sendCode(code(), s.phone) : null;
        if (!r) {
          markSent('local'); // 서버 없음: 화면 안에서만 진행
        } else if (r.status === 'invalid') {
          input.apply({ ok: false, error: true, msg: r.message });
          return;
        } else if (r.status === 'limit') {
          actionError(r.message);
          markSent('limit');
        } else {
          markSent('sent', r.demoCode || null);
        }
        ctx.go('verify');
      },
    };
  },
};
