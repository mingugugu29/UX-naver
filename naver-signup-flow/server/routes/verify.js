// POST /api/verify/send     인증번호 발급 (월 1회, 3분)
// POST /api/verify/confirm  인증번호 확인
const { Router } = require('express');
const verify = require('../services/verifyService');

const router = Router();

router.post('/send', (req, res) => {
  const result = verify.send(req.body || {});
  const status = { sent: 200, limit: 429, invalid: 400 }[result.status] || 200;
  res.status(status).json(result);
});

router.post('/confirm', (req, res) => {
  const result = verify.confirm(req.body || {});
  res.status(result.verified ? 200 : 400).json(result);
});

module.exports = router;
