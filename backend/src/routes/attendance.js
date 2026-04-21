const { Router } = require('express');
const crypto = require('crypto');
const { param, body, validationResult } = require('express-validator');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const attendanceController = require('../controllers/attendance');

const router = Router();

/** QR token expiry — 30 seconds */
const QR_EXPIRY_MS = 30 * 1000;

// All attendance routes require authentication
router.use(authMiddleware);

/**
 * GET /api/attendance/me/summary
 * Student-only. Returns the logged-in student's overall and per-class
 * attendance summary.
 */
router.get('/me/summary', attendanceController.getMyAttendanceSummary);

/**
 * POST /api/attendance/qr/generate
 * Teacher or admin generates a QR token for a class. Token expires after 30 seconds.
 */
router.post(
  '/qr/generate',
  [body('class_id').isUUID().withMessage('Valid class_id is required')],
  async (req, res, next) => {
    try {
      if (req.user.role === 'student') {
        return res.status(403).json({ success: false, error: 'Only teachers and admins can generate QR tokens' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { class_id } = req.body;

      // Verify the class exists
      const cls = await db.query('SELECT id FROM classes WHERE id = $1', [class_id]);
      if (cls.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Class not found' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + QR_EXPIRY_MS);

      const result = await db.query(
        `INSERT INTO qr_tokens (class_id, token, created_by, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id, token, expires_at`,
        [class_id, token, req.user.id, expiresAt],
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/attendance/qr/scan
 * Student scans a QR token to mark attendance.
 */
router.post(
  '/qr/scan',
  [body('token').trim().notEmpty().withMessage('Token is required')],
  async (req, res, next) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ success: false, error: 'Only students can scan QR tokens' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { token } = req.body;

      // Find the token and check validity
      const tokenResult = await db.query(
        'SELECT id, class_id, expires_at, used FROM qr_tokens WHERE token = $1',
        [token],
      );

      if (tokenResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Invalid QR token' });
      }

      const qrToken = tokenResult.rows[0];

      if (qrToken.used) {
        return res.status(410).json({ success: false, error: 'QR token has already been used' });
      }

      if (new Date(qrToken.expires_at) < new Date()) {
        return res.status(410).json({ success: false, error: 'QR token has expired' });
      }

      // Mark token as used
      await db.query('UPDATE qr_tokens SET used = true WHERE id = $1', [qrToken.id]);

      // Insert attendance record
      const attendance = await db.query(
        `INSERT INTO attendance_records (student_id, class_id, method)
         VALUES ($1, $2, 'qr')
         ON CONFLICT (student_id, class_id, date) DO NOTHING
         RETURNING *`,
        [req.user.id, qrToken.class_id],
      );

      if (attendance.rows.length === 0) {
        return res.status(409).json({ success: false, error: 'Attendance already marked for today' });
      }

      // Look up the student name for the real-time event
      const studentRow = await db.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
      const studentName = studentRow.rows.length > 0 ? studentRow.rows[0].name : 'Unknown';

      // Emit socket event to the teacher's attendance room
      const io = req.app.get('io');
      io.to(`attendance:${qrToken.class_id}`).emit('attendance:marked', {
        studentName,
        markedAt: attendance.rows[0].marked_at,
        student_id: req.user.id,
        class_id: qrToken.class_id,
      });

      res.status(201).json({ success: true, data: attendance.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/attendance/face/recognize
 * Teacher/admin only. Proxies an image to the Flask AI service, then marks
 * attendance for each recognized student.
 */
router.post(
  '/face/recognize',
  (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can mark face attendance' });
    }
    next();
  },
  attendanceController.recognizeFaces,
);

/**
 * POST /api/attendance/session/close
 * Teacher-only. Inserts 'absent' for every enrolled student who has no
 * attendance record for today. Emits `attendance:session-closed` on
 * `attendance:<class_id>`.
 */
router.post('/session/close', attendanceController.closeSession);

/**
 * POST /api/attendance/manual
 * Teacher or admin only. Upserts a manual attendance record.
 */
router.post('/manual', attendanceController.manualMark);

/**
 * GET /api/attendance/class/:classId
 * Returns attendance records for a class. Teacher/admin only.
 */
router.get(
  '/class/:classId',
  [param('classId').isUUID().withMessage('Invalid class ID')],
  async (req, res, next) => {
    try {
      if (req.user.role === 'student') {
        return res.status(403).json({ success: false, error: 'Only teachers and admins can view class attendance' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const result = await db.query(
        `SELECT ar.*, u.name AS student_name
         FROM attendance_records ar
         JOIN users u ON ar.student_id = u.id
         WHERE ar.class_id = $1
         ORDER BY ar.date DESC, ar.marked_at DESC`,
        [req.params.classId],
      );

      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
