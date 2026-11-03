// 가입 과정에서 입력한 값 (예시 데이터로 시작, 브라우저 밖으로 나가지 않음)
const defaults = () => ({
  terms: { required: false, location: false, privacy: false, ads: false },
  idType: 'real',
  name: '홍길동',
  birth: '20000101',
  gender: 'female',
  phone: '01012345678',
  sendCount: 0,
  sentAt: null,
  verified: false,
  userId: 'hong_gildong',
  password: '',
  passkey: false,
  returnTo: null, // '수정'으로 들어왔을 때 돌아갈 화면
});

export const state = defaults();

export function resetState() {
  Object.assign(state, defaults());
}

export const idTypeLabel = { real: '실명 인증 아이디', basic: '일반 아이디' };
export const genderLabel = { male: '남성', female: '여성', none: '선택 안 함' };
