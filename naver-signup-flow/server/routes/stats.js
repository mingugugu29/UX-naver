// GET /api/stats  측정 결과
const { Router } = require('express');
const stats = require('../services/statsService');

const router = Router();

router.get('/', (req, res) => {
  res.json(stats.overview());
});

module.exports = router;
