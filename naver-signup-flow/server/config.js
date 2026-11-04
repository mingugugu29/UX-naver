// 서버 설정 (환경 변수로 바꿀 수 있음)
const path = require('path');

module.exports = {
  port: Number(process.env.PORT) || 3000,

  // SQLite 파일 위치. 무료 호스팅은 재시작하면 디스크가 초기화될 수 있다.
  dbPath: process.env.DB_PATH || path.join(__dirname, 'data', 'signup.db'),

  // 프로토타입 화면 폴더 (서버가 같은 주소에서 화면도 함께 보여준다)
  staticDir: path.join(__dirname, '..', 'prototype'),

  // 체험 모드: 실제 문자를 보내지 않고, 만든 인증번호를 화면에 보여준다
  demoMode: process.env.DEMO_MODE !== 'false',

  // 발표용으로 항상 통과하는 인증번호
  testCodes: ['123123', '123456'],

  // 인증 규칙 (교안의 '제약' 원칙을 서버에서 지킨다)
  verify: {
    monthlyLimit: 1, // 한 번호당 한 달에 받을 수 있는 인증번호 수
    codeTtlSeconds: 180, // 인증번호 유효 시간 (3분)
  },

  // 처음부터 '이미 사용 중'으로 둘 아이디
  reservedIds: ['admin', 'hong123', 'test01', 'user01', 'naver'],
};
