// POST /api/signup  가입 저장
const { Router } = require('express');
const signup = require('../services/signupService');

const router = Router();

router.post('/', (req, res) => {
  const { status = 201, ok, ...rest } = signup.create(req.body || {});
  res.status(ok ? 201 : status).json({ ok, ...rest });
});

module.exports = router;
