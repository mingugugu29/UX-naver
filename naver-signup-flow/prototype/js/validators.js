// 입력값 형식 맞추기와 검사
// 검사 결과: { ok, error, msg } — ok면 통과, error면 빨간 안내, 둘 다 아니면 아직 입력 중

export const digits = (v) => String(v ?? '').replace(/\D/g, '');

/* 이름 */
const NAME_HELP = '한글, 영문 대/소문자만 쓸 수 있어요. (특수기호, 공백 제외)';
export function checkName(v) {
  if (!v) return { ok: false, error: false, msg: NAME_HELP };
  if (!/^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z]+$/.test(v)) {
    return { ok: false, error: true, msg: '특수기호나 공백은 빼고 입력해 주세요.' };
  }
  return { ok: /^[가-힣a-zA-Z]+$/.test(v), error: false, msg: NAME_HELP };
}

/* 생년월일 */
export function formatBirth(v) {
  const d = digits(v).slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
}

export function checkBirth(v) {
  const d = digits(v);
  if (d.length < 8) {
    return { ok: false, error: false, msg: '생년월일 8자리를 입력해 주세요. 예) 20000101' };
  }
  const y = +d.slice(0, 4);
  const m = +d.slice(4, 6);
  const day = +d.slice(6, 8);
  const date = new Date(y, m - 1, day);
  const real = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === day;
  if (!real || y < 1900) return { ok: false, error: true, msg: '없는 날짜예요. 다시 확인해 주세요.' };
  if (date > new Date()) return { ok: false, error: true, msg: '오늘 이후 날짜는 입력할 수 없어요.' };
  return { ok: true, error: false, msg: '' };
}

/* 휴대전화 번호 */
const PHONE_HELP = "'-' 없이 숫자만 입력해도 돼요";
export function formatPhone(v) {
  const d = digits(v).slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export function checkPhone(v) {
  const d = digits(v);
  if (d.length < 10) return { ok: false, error: false, msg: PHONE_HELP };
  if (!/^01[016789]\d{7,8}$/.test(d)) {
    return { ok: false, error: true, msg: '휴대전화 번호 형식이 아니에요. 010으로 시작하는지 확인해 주세요.' };
  }
  return { ok: true, error: false, msg: '' };
}

/* 아이디 */
const ID_HELP = '5~20자의 영문 소문자, 숫자, 특수기호 _ - 만 쓸 수 있어요.';
const TAKEN = ['admin', 'hong123', 'test01', 'user01'];
export function checkUserId(v) {
  if (!v) return { ok: false, error: false, msg: ID_HELP };
  if (!/^[a-z0-9_-]+$/.test(v)) {
    return { ok: false, error: true, msg: '영문 소문자, 숫자, 특수기호 _ - 만 쓸 수 있어요.' };
  }
  if (v.length < 5) return { ok: false, error: false, msg: ID_HELP };
  if (v.length > 20) return { ok: false, error: true, msg: '20자 이하로 입력해 주세요.' };
  if (TAKEN.includes(v)) {
    return { ok: false, error: true, msg: `이미 사용 중인 아이디예요. 예) ${v}_01` };
  }
  return { ok: true, error: false, msg: '사용할 수 있는 아이디예요' };
}

/* 비밀번호 */
export const PASSWORD_RULES = [
  { label: '8~16자', hint: '8~16자로 입력해 주세요', test: (v) => v.length >= 8 && v.length <= 16 },
  { label: '영문', hint: '영문을 1개 이상 넣어 주세요', test: (v) => /[A-Za-z]/.test(v) },
  { label: '숫자', hint: '숫자를 1개 이상 넣어 주세요', test: (v) => /\d/.test(v) },
  { label: '특수문자', hint: '특수문자를 1개 이상 넣어 주세요', test: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

export function passwordStrength(v) {
  if (!v) return { label: '—', tone: '' };
  const met = PASSWORD_RULES.filter((r) => r.test(v)).length;
  if (met <= 2) return { label: '사용 불가', tone: 'bad' };
  if (met === 3) return { label: '보통', tone: '' };
  return { label: '안전', tone: 'good' };
}
