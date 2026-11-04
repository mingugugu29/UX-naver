// 가입 과정에서 입력한 값 (예시 데이터로 시작, 브라우저 밖으로 나가지 않음)
const defaults = () => ({
  terms: { required: false, location: false, privacy: false, ads: false },
  idType: 'real',
  name: '홍길동',
  birth: '20000101',
  gender: 'female',
  country: { name: '대한민국', code: '+82' },
  phone: '01012345678',
  sendCount: 0,
  sentAt: null,
  verified: false,
  // 서버에 가입이 저장되므로, 체험할 때마다 겹치지 않는 예시 아이디를 쓴다
  userId: `hong_${Math.floor(1000 + Math.random() * 9000)}`,
  sendResult: null, // 서버 응답: 'sent' | 'limit' | 'local'
  demoCode: null, // 체험 모드에서 서버가 만든 인증번호
  password: '',
  passwordConfirm: '',
  passkey: false,
  returnTo: null, // '수정'으로 들어왔을 때 돌아갈 화면
});

export const state = defaults();

export function resetState() {
  Object.assign(state, defaults());
}

export const idTypeLabel = { real: '실명 인증 아이디', basic: '일반 아이디' };
export const genderLabel = { male: '남성', female: '여성', none: '비밀' };
