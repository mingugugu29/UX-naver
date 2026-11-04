// 09 아이디: 입력하는 동안 사용 가능 여부 안내 (서버가 있으면 서버 DB에서 중복 확인)
import { field } from '../components/field.js';
import { checkUserId } from '../validators.js';
import { isOnline, checkId } from '../api.js';

const DEBOUNCE_MS = 300;

export default {
  id: 'userId',
  step: 4,
  title: '사용할 아이디를 만들어 주세요',

  render(ctx) {
    const s = ctx.state;
    let serverResult = null; // 서버 확인 결과 (확인 중이면 null)
    let timer = null;

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

    function askServer(value) {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const r = await checkId(value);
        if (value !== s.userId) return; // 기다리는 동안 입력이 바뀜
        serverResult = r
          ? { ok: r.available, error: !r.available, msg: r.message }
          : checkUserId(value); // 서버가 응답하지 않으면 화면 규칙으로 대신
        input.apply(serverResult);
        ctx.refresh();
      }, DEBOUNCE_MS);
    }

    function update(refresh = true) {
      const local = checkUserId(s.userId);
      serverResult = null;
      if (local.ok && isOnline()) {
        input.setStatus('default', '사용할 수 있는지 확인하고 있어요…');
        askServer(s.userId);
      } else {
        clearTimeout(timer);
        input.apply(local);
      }
      if (refresh) ctx.refresh();
    }
    update(false);

    return {
      sub: '이미 쓰이는 아이디 예시: admin, hong123',
      body: input.el,
      primary: '다음',
      validate: () => {
        const ok = isOnline() ? Boolean(serverResult && serverResult.ok) : checkUserId(s.userId).ok;
        return { ok, hint: '사용할 수 있는 아이디를 입력해 주세요' };
      },
      onNext: () => ctx.next('password'),
      cleanup: () => clearTimeout(timer),
    };
  },
};
