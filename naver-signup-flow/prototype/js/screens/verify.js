// 07 휴대폰 인증 (발송 후): 보낸 번호 안내, 남은 시간, 문자가 안 올 때 해결 방법
import { h } from '../dom.js';
import { field } from '../components/field.js';
import { notice } from '../components/notice.js';
import { digits, formatPhone } from '../validators.js';
import { TEST_CODES, CODE_SECONDS } from './content.js';

const pad = (n) => String(n).padStart(2, '0');

export default {
  id: 'verify',
  step: 3,
  title: '문자로 받은 인증번호를 입력해 주세요',

  render(ctx) {
    const s = ctx.state;
    s.sentAt ??= Date.now();
    let code = '';

    const input = field({
      id: 'code',
      label: '인증번호 6자리',
      inputmode: 'numeric',
      maxlength: 6,
      autocomplete: 'one-time-code',
      format: (v) => digits(v).slice(0, 6),
      onValue: (v) => {
        code = v;
        input.setStatus('default', '');
        ctx.refresh();
      },
    });

    const secondsLeft = () =>
      Math.max(0, CODE_SECONDS - Math.floor((Date.now() - s.sentAt) / 1000));

    const time = h('span', { class: 'timer-time', 'aria-live': 'off' });
    const messages = h('div', { class: 'stack' });

    const resend = h('button', {
      type: 'button',
      class: 'link',
      onclick: () => messages.replaceChildren(notice('error',
        '이번 달 인증번호 발송 횟수(1회)를 모두 썼어요. 이미 받은 인증번호를 입력하거나 고객센터에 문의해 주세요.')),
    }, '인증번호 다시 받기');

    const timer = h('div', { class: 'timer' }, h('span', {}, '남은 시간 ', time), resend);

    const restartTimer = h('button', {
      type: 'button',
      class: 'link',
      hidden: true,
      onclick: () => {
        s.sentAt = Date.now();
        restartTimer.hidden = true;
        input.input.disabled = false;
        input.setStatus('default', '');
        tick();
        input.input.focus();
      },
    }, '체험용: 시간 다시 시작');

    function tick(refresh = true) {
      const left = secondsLeft();
      time.textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
      timer.classList.toggle('expired', left === 0);
      if (left === 0 && !input.input.disabled) {
        input.input.disabled = true;
        input.setStatus('error', '입력 시간이 지났어요.');
        restartTimer.hidden = false;
      }
      if (refresh) ctx.refresh();
    }
    tick(false);
    const interval = setInterval(tick, 1000);

    return {
      sub: `${formatPhone(s.phone)}로 인증번호를 보냈어요`,
      body: [
        input.el,
        timer,
        restartTimer,
        messages,
        notice('info', '문자가 오지 않나요? 스팸 문자함을 먼저 확인해 주세요. 이번 달 인증 횟수를 이미 썼다면 고객센터에서 도움을 받을 수 있어요.'),
      ],
      primary: '인증하기',
      validate: () => {
        if (secondsLeft() === 0) return { ok: false, hint: '시간이 지나 인증할 수 없어요' };
        return { ok: code.length === 6, hint: '문자로 받은 6자리를 입력해 주세요' };
      },
      onNext: () => {
        if (TEST_CODES.includes(code)) {
          s.verified = true;
          ctx.next('confirm');
        } else {
          input.setStatus('error', '인증번호가 맞지 않아요. 문자로 받은 6자리를 다시 확인해 주세요.');
        }
      },
      cleanup: () => clearInterval(interval),
    };
  },
};
