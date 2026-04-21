const { Router } = require('express');
const { param, validationResult } = require('express-validator');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = Router();

// All insights routes require authentication
router.use(authMiddleware);

/**
 * GET /api/insights/teacher
 * Returns a productivity overview for the logged-in teacher:
 * total students, per-class stats, at-risk students, and task completion rate.
 */
router.get('/teacher', async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can view insights' });
    }

    const teacherId = req.user.id;

    // Total distinct students enrolled across all of this teacher's classes
    const totalStudentsResult = await db.query(
      `SELECT COUNT(DISTINCT e.student_id) AS total_students
       FROM enrollments e
       JOIN classes c ON e.class_id = c.id
       WHERE c.teacher_id = $1`,
      [teacherId],
    );
    const totalStudents = parseInt(totalStudentsResult.rows[0].total_students, 10);

    // Per-class stats: enrolled count and total classes held
    const classesResult = await db.query(
      `SELECT
         c.id AS class_id,
         c.name AS class_name,
         c.subject,
         COUNT(DISTINCT e.student_id) AS enrolled_count,
         COUNT(DISTINCT ar.date) AS total_classes_held,
         COUNT(ar.id) FILTER (WHERE ar.method != 'absent') AS total_attendance_marks
       FROM classes c
       LEFT JOIN enrollments e ON e.class_id = c.id
       LEFT JOIN attendance_records ar ON ar.class_id = c.id
       WHERE c.teacher_id = $1
       GROUP BY c.id, c.name, c.subject`,
      [teacherId],
    );

    const classes = classesResult.rows.map((row) => {
      const enrolled = parseInt(row.enrolled_count, 10);
      const held = parseInt(row.total_classes_held, 10);
      const marks = parseInt(row.total_attendance_marks, 10);
      const denominator = enrolled * held;
      return {
        class_id: row.class_id,
        class_name: row.class_name,
        subject: row.subject,
        enrolled_count: enrolled,
        total_classes_held: held,
        attendance_rate: denominator > 0 ? parseFloat(((marks / denominator) * 100).toFixed(1)) : 0,
      };
    });

    // At-risk students: attendance below 75% in any of this teacher's classes
    const atRiskResult = await db.query(
      `SELECT
         u.id AS student_id,
         u.name AS student_name,
         c.id AS class_id,
         c.name AS class_name,
         COUNT(ar.id) FILTER (WHERE ar.method != 'absent') AS attendance_count,
         class_dates.total_classes_held,
         CASE
           WHEN class_dates.total_classes_held = 0 THEN 0
           ELSE COUNT(ar.id) FILTER (WHERE ar.method != 'absent')::float / class_dates.total_classes_held
         END AS attendance_rate
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       JOIN classes c ON e.class_id = c.id
       JOIN (
         SELECT class_id, COUNT(DISTINCT date) AS total_classes_held
         FROM attendance_records
         GROUP BY class_id
       ) class_dates ON class_dates.class_id = c.id
       LEFT JOIN attendance_records ar ON ar.student_id = u.id AND ar.class_id = c.id
       WHERE c.teacher_id = $1
         AND class_dates.total_classes_held > 0
       GROUP BY u.id, u.name, c.id, c.name, class_dates.total_classes_held
       HAVING CASE
         WHEN class_dates.total_classes_held = 0 THEN 0
         ELSE COUNT(ar.id) FILTER (WHERE ar.method != 'absent')::float / class_dates.total_classes_held
       END < 0.75`,
      [teacherId],
    );

    const atRiskStudents = atRiskResult.rows.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name,
      class_id: row.class_id,
      class_name: row.class_name,
      attendance_count: parseInt(row.attendance_count, 10),
      total_classes_held: parseInt(row.total_classes_held, 10),
      attendance_rate: parseFloat((parseFloat(row.attendance_rate) * 100).toFixed(1)),
    }));

    res.json({
      success: true,
      data: {
        total_students: totalStudents,
        classes,
        at_risk_students: atRiskStudents,
        task_completion_rate: 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/insights/class/:classId
 * Detailed attendance view for a single class.
 * The class must belong to the logged-in teacher, or the user must be an admin.
 */
router.get(
  '/class/:classId',
  [param('classId').isUUID().withMessage('Invalid class ID')],
  async (req, res, next) => {
    try {
      if (req.user.role === 'student') {
        return res.status(403).json({ success: false, error: 'Only teachers and admins can view class insights' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { classId } = req.params;

      // Verify class exists and belongs to this teacher (or user is admin)
      const classResult = await db.query(
        'SELECT id, name, subject, teacher_id FROM classes WHERE id = $1',
        [classId],
      );

      if (classResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Class not found' });
      }

      const cls = classResult.rows[0];
      if (req.user.role !== 'admin' && cls.teacher_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'You do not own this class' });
      }

      // Total classes held for this class
      const heldResult = await db.query(
        'SELECT COUNT(DISTINCT date) AS total_classes_held FROM attendance_records WHERE class_id = $1',
        [classId],
      );
      const totalClassesHeld = parseInt(heldResult.rows[0].total_classes_held, 10);

      // Per-student attendance
      const studentsResult = await db.query(
        `SELECT
           u.id AS student_id,
           u.name AS student_name,
           COUNT(ar.id) FILTER (WHERE ar.method != 'absent') AS attendance_count
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         LEFT JOIN attendance_records ar ON ar.student_id = u.id AND ar.class_id = $1
         WHERE e.class_id = $1
         GROUP BY u.id, u.name
         ORDER BY u.name`,
        [classId],
      );

      const students = studentsResult.rows.map((row) => {
        const count = parseInt(row.attendance_count, 10);
        const rate = totalClassesHeld > 0 ? parseFloat(((count / totalClassesHeld) * 100).toFixed(1)) : 0;
        return {
          student_id: row.student_id,
          student_name: row.student_name,
          attendance_count: count,
          attendance_rate: rate,
          at_risk: rate < 75,
        };
      });

      res.json({
        success: true,
        data: {
          class_id: cls.id,
          class_name: cls.name,
          subject: cls.subject,
          total_classes_held: totalClassesHeld,
          students,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
