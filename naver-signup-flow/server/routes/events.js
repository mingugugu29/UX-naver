// POST /api/events  사용성 측정 기록 (여러 건을 한 번에)
const { Router } = require('express');
const events = require('../services/eventService');

const router = Router();

router.post('/', (req, res) => {
  const result = events.record(req.body || {});
  res.status(result.ok ? 200 : 400).json(result);
});

module.exports = router;
