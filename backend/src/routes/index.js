const { Router } = require('express');

const router = Router();

/**
 * Health-check endpoint (public — no auth required).
 */
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

router.use('/auth', require('./auth'));

router.use('/classes', require('./classes'));

router.use('/attendance', require('./attendance'));

router.use('/timetable', require('./timetable'));
router.use('/tasks', require('./tasks'));
router.use('/insights', require('./insights'));
router.use('/admin', require('./admin'));
// router.use('/resources', require('./resources'));

module.exports = router;
