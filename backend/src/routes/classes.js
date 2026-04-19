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
 * GET /api/classes/me
 * Student-only. Returns all classes the logged-in student is enrolled in,
 * including subject and the teacher's name. Registered before the
 * `/:id` UUID route so the literal `me` path takes precedence.
 */
router.get('/me', async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can view their enrolled classes' });
    }

    const result = await db.query(
      `SELECT c.id AS class_id,
              c.name AS class_name,
              c.subject,
              u.name AS teacher_name
       FROM enrollments e
       JOIN classes c ON c.id = e.class_id
       JOIN users u ON u.id = c.teacher_id
       WHERE e.student_id = $1
       ORDER BY c.name`,
      [req.user.id],
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/classes/teacher/students
 * Teacher-only. Returns one row per (student, class) pair for every student
 * enrolled in any class owned by the logged-in teacher, plus per-pair
 * attendance stats. `total_classes_held` follows the project convention
 * (COUNT(DISTINCT date) FROM attendance_records WHERE class_id = ...).
 * Registered before the `/:id` UUID route so the literal path takes precedence.
 */
router.get('/teacher/students', async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, error: 'Only teachers can view their students' });
    }

    const result = await db.query(
      `SELECT
         u.id   AS student_id,
         u.name AS name,
         u.email,
         c.id   AS class_id,
         c.name AS class_name,
         COUNT(ar.id) AS attendance_count,
         COALESCE(class_dates.total_classes_held, 0) AS total_classes_held
       FROM enrollments e
       JOIN classes c ON c.id = e.class_id
       JOIN users u ON u.id = e.student_id
       LEFT JOIN (
         SELECT class_id, COUNT(DISTINCT date) AS total_classes_held
         FROM attendance_records
         GROUP BY class_id
       ) class_dates ON class_dates.class_id = c.id
       LEFT JOIN attendance_records ar
         ON ar.class_id = c.id AND ar.student_id = u.id
       WHERE c.teacher_id = $1
       GROUP BY u.id, u.name, u.email, c.id, c.name, class_dates.total_classes_held
       ORDER BY c.name, u.name`,
      [req.user.id],
    );

    const data = result.rows.map((row) => {
      const attendanceCount = parseInt(row.attendance_count, 10);
      const totalClassesHeld = parseInt(row.total_classes_held, 10);
      const attendancePercentage = totalClassesHeld > 0
        ? Math.round((attendanceCount / totalClassesHeld) * 100)
        : 0;
      return {
        student_id: row.student_id,
        name: row.name,
        email: row.email,
        class_name: row.class_name,
        class_id: row.class_id,
        attendance_count: attendanceCount,
        total_classes_held: totalClassesHeld,
        attendance_percentage: attendancePercentage,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

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
