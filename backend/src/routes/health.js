const { Router } = require('express');
const { getDbStatus } = require('../db/mongo');
const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'up',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: getDbStatus(),
  });
});

module.exports = router;
