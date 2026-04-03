const { Router } = require('express');

const router = Router();

/**
 * Health-check endpoint (public — no auth required).
 */
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Future sub-route mounts:
// router.use('/auth', require('./auth'));
// router.use('/attendance', require('./attendance'));
// router.use('/classes', require('./classes'));
// router.use('/tasks', require('./tasks'));
// router.use('/resources', require('./resources'));

module.exports = router;
