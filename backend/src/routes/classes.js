const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = Router();

// All class routes require authentication
router.use(authMiddleware);

/**
 * GET /api/classes
 * Lists all classes. Teachers see their own; admins see all; students see enrolled.
 */
router.get('/', async (req, res, next) => {
  try {
    let result;

    if (req.user.role === 'admin') {
      result = await db.query(
        `SELECT c.*, u.name AS teacher_name
         FROM classes c JOIN users u ON c.teacher_id = u.id
         ORDER BY c.name`,
      );
    } else if (req.user.role === 'teacher') {
      result = await db.query(
        `SELECT c.*, u.name AS teacher_name
         FROM classes c JOIN users u ON c.teacher_id = u.id
         WHERE c.teacher_id = $1
         ORDER BY c.name`,
        [req.user.id],
      );
    } else {
      result = await db.query(
        `SELECT c.*, u.name AS teacher_name
         FROM classes c
         JOIN users u ON c.teacher_id = u.id
         JOIN enrollments e ON e.class_id = c.id
         WHERE e.student_id = $1
         ORDER BY c.name`,
        [req.user.id],
      );
    }

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/classes
 * Creates a new class. Teacher/admin only.
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Class name is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
  ],
  async (req, res, next) => {
    try {
      if (req.user.role === 'student') {
        return res.status(403).json({ success: false, error: 'Students cannot create classes' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { name, subject } = req.body;
      // Teachers create their own classes; admins can optionally specify teacher_id
      const teacherId = req.user.role === 'admin' && req.body.teacher_id
        ? req.body.teacher_id
        : req.user.id;

      const result = await db.query(
        `INSERT INTO classes (name, subject, teacher_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, subject, teacherId],
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/classes/:id
 * Returns a single class with its timetable entries.
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid class ID')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const classResult = await db.query(
        `SELECT c.*, u.name AS teacher_name
         FROM classes c JOIN users u ON c.teacher_id = u.id
         WHERE c.id = $1`,
        [req.params.id],
      );

      if (classResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Class not found' });
      }

      const timetableResult = await db.query(
        `SELECT id, day_of_week, start_time, end_time, room
         FROM timetable_entries
         WHERE class_id = $1
         ORDER BY day_of_week, start_time`,
        [req.params.id],
      );

      const data = { ...classResult.rows[0], timetable: timetableResult.rows };
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/classes/:id/enroll
 * Enrolls a student in a class. Teacher/admin only.
 */
router.post(
  '/:id/enroll',
  [
    param('id').isUUID().withMessage('Invalid class ID'),
    body('student_id').isUUID().withMessage('Valid student_id is required'),
  ],
  async (req, res, next) => {
    try {
      if (req.user.role === 'student') {
        return res.status(403).json({ success: false, error: 'Students cannot enroll others' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      // Verify the student exists and has role 'student'
      const student = await db.query(
        'SELECT id, role FROM users WHERE id = $1',
        [req.body.student_id],
      );
      if (student.rows.length === 0 || student.rows[0].role !== 'student') {
        return res.status(400).json({ success: false, error: 'User is not a valid student' });
      }

      // Verify the class exists
      const cls = await db.query('SELECT id FROM classes WHERE id = $1', [req.params.id]);
      if (cls.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Class not found' });
      }

      const result = await db.query(
        `INSERT INTO enrollments (class_id, student_id)
         VALUES ($1, $2)
         ON CONFLICT (class_id, student_id) DO NOTHING
         RETURNING *`,
        [req.params.id, req.body.student_id],
      );

      if (result.rows.length === 0) {
        return res.status(409).json({ success: false, error: 'Student already enrolled in this class' });
      }

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
