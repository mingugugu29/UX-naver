# 백엔드 · 사용성 측정 서버

개선한 회원가입 프로토타입에 붙인 서버예요. 두 가지 일을 해요.

1. **개선안의 규칙을 서버에서 실제로 지키기**: 아이디 중복 확인, 인증번호 월 1회 제한·3분 만료, 가입 저장
2. **개선 효과를 측정하기**: 화면별로 머문 시간, 오류, 멈춘 곳, 가입 완료까지 걸린 시간을 모아 결과 페이지(`/stats`)로 보여줘요

서버가 꺼져 있거나 파일로 열면 프로토타입은 지금처럼 화면 안에서만 동작해요 (발표 중 서버 문제로 시연이 멈추지 않게).

## 구조

```
server/
├── index.js              시작점: API + 프로토타입 화면을 같은 주소에서 제공
├── config.js             포트, DB 위치, 월 1회·3분 같은 규칙, 체험 모드
├── db/database.js        SQLite 연결과 테이블 (users, verifications, events)
├── routes/               주소별 요청 처리
│   ├── ids.js            GET  /api/ids/check
│   ├── verify.js         POST /api/verify/send, /api/verify/confirm
│   ├── signup.js         POST /api/signup
│   ├── events.js         POST /api/events
│   └── stats.js          GET  /api/stats
└── services/             실제 규칙
    ├── idService.js      아이디 형식·중복, 비슷한 빈 아이디 제안
    ├── verifyService.js  인증번호 발급(월 1회)·확인(3분)
    ├── signupService.js  가입 저장
    ├── eventService.js   측정 기록 저장
    └── statsService.js   완료율·소요 시간·오류·이탈 계산

prototype/js/
├── api.js                서버 호출 (서버가 없으면 null → 화면 규칙으로 대신)
└── analytics.js          측정 기록 (화면 진입·이탈, 오류, 완료)
```

## API

| 주소 | 하는 일 | 연결된 UX 원칙 |
|---|---|---|
| `GET /api/health` | 서버 상태 | |
| `GET /api/ids/check?userId=` | 사용 가능 여부, 이미 쓰면 비슷한 빈 아이디 제안 | 피드백 |
| `POST /api/verify/send` | 인증번호 발급. 같은 번호는 한 달에 1번 (넘으면 429) | 제약 |
| `POST /api/verify/confirm` | 인증번호 확인. 3분 지나면 만료 | 가시성 · 오류 복구 |
| `POST /api/signup` | 가입 저장 (중복이면 409) | 오류 예방 |
| `POST /api/events` | 측정 기록 (화면 진입·이탈, 오류, 완료) | |
| `GET /api/stats` | 측정 결과 | |

## 저장하는 것 / 하지 않는 것

- 저장: 아이디, 아이디 유형, 성별, 국가 번호, 화면별 시간·오류 기록
- **저장하지 않음**: 이름, 생년월일, 비밀번호. 전화번호는 월 1회 검사용 해시로만 남김
- 실제 문자는 보내지 않아요. 체험 모드에서는 서버가 만든 인증번호를 화면에 보여주고, 발표용 `123123`은 항상 통과해요.

## 내 컴퓨터에서 실행

Node.js 20 이상이 필요해요.

```bash
cd naver-signup-flow/server
npm install
npm start
```

- 프로토타입: http://localhost:3000
- 측정 결과: http://localhost:3000/stats
- 기록은 `server/data/signup.db` 에 쌓여요 (GitHub에는 올라가지 않음)

## 공개 주소 만들기 (Render 무료)

1. https://render.com 에 GitHub 계정으로 가입
2. **New › Blueprint** → 이 저장소 선택 → 저장소 맨 위의 `render.yaml`을 읽어 자동 설정
3. 배포가 끝나면 `https://ux-naver-signup.onrender.com` 같은 주소가 생겨요 (이름이 겹치면 뒤에 글자가 붙음)

**무료 요금제에서 알아둘 것**
- 한동안 아무도 안 들어오면 서버가 잠들어서, 첫 접속이 수십 초 걸릴 수 있어요. 발표 직전에 한 번 열어 깨워 두세요.
- 재시작하면 디스크가 초기화될 수 있어서, 측정 기록이 사라질 수 있어요. **사용성 테스트는 내 컴퓨터에서 진행**하고 결과 페이지를 캡처해 두는 걸 추천해요.

## 측정 방법 (사용성 테스트)

1. 서버를 켜고 참가자에게 http://localhost:3000 을 열어 줘요 (같은 와이파이면 `http://내컴퓨터IP:3000`)
2. 과제: "아이디 유형을 고르고 회원가입을 끝까지 해 주세요." (도와주지 않고 지켜보기)
3. 5명 정도 끝나면 `/stats`에서 결과 확인
4. 결과는 설계 의도가 아니라 **실제로 측정한 값**으로만 이야기해요. 인원이 적으면 그 점도 함께 밝혀요.

개선 전 흐름도 재현해서 기록을 `variant: "before"`로 보내면 결과 페이지에 개선 전/후가 나란히 비교돼요 (`analytics.js`의 `VARIANT`).
