// GET /api/ids/check?userId=...  아이디 사용 가능 여부
const { Router } = require('express');
const ids = require('../services/idService');

const router = Router();

router.get('/check', (req, res) => {
  const userId = String(req.query.userId || '').trim().toLowerCase();
  res.json(ids.check(userId));
});

module.exports = router;
