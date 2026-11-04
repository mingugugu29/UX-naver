// 서버 시작점: API + 프로토타입 화면을 같은 주소에서 제공
const express = require('express');
const config = require('./config');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

// 화면에서 서버가 켜져 있는지 확인할 때 쓴다
app.get('/api/health', (req, res) => {
  res.json({ ok: true, demoMode: config.demoMode });
});

app.use('/api/ids', require('./routes/ids'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/signup', require('./routes/signup'));
app.use('/api/events', require('./routes/events'));
app.use('/api/stats', require('./routes/stats'));

app.use('/api', (req, res) => res.status(404).json({ ok: false, message: '없는 주소예요.' }));

// 프로토타입 화면 (index.html, stats.html, css, js)
app.use(express.static(config.staticDir, { extensions: ['html'] }));

// 처리하지 못한 오류
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ ok: false, message: '서버에서 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' });
});

app.listen(config.port, () => {
  console.log(`회원가입 프로토타입: http://localhost:${config.port}`);
  console.log(`측정 결과:         http://localhost:${config.port}/stats`);
});
