const { Router } = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

/**
 * Admin authorization middleware.
 * Returns 403 if the authenticated user is not an admin.
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * School-wide overview: totals, overall attendance rate, active classes today.
 */
router.get('/stats', async (req, res, next) => {
  try {
    // JS getDay(): 0=Sun,1=Mon,...,6=Sat → convert to 0=Mon,...,4=Fri; -1 or 5+ = weekend
    const todayIndex = new Date().getDay() - 1;

    const [studentsRes, teachersRes, classesRes, attendanceRes, activeRes] = await Promise.all([
      db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'"),
      db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'teacher'"),
      db.query('SELECT COUNT(*) AS count FROM classes'),
      db.query(
        `SELECT
           COALESCE(SUM(actual), 0) AS actual_count,
           COALESCE(SUM(expected), 0) AS expected_count
         FROM (
           SELECT
             ar.class_id,
             ar.date,
             COUNT(ar.id) AS actual,
             (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = ar.class_id) AS expected
           FROM attendance_records ar
           GROUP BY ar.class_id, ar.date
         ) sub`,
      ),
      todayIndex >= 0 && todayIndex <= 4
        ? db.query(
            `SELECT COUNT(DISTINCT c.id) AS count
             FROM classes c
             JOIN timetable_entries te ON te.class_id = c.id
             WHERE te.day_of_week = $1`,
            [todayIndex],
          )
        : Promise.resolve({ rows: [{ count: 0 }] }),
    ]);

    const actualCount = parseInt(attendanceRes.rows[0].actual_count, 10);
    const expectedCount = parseInt(attendanceRes.rows[0].expected_count, 10);
    const overallAttendanceRate = expectedCount > 0
      ? Math.round((actualCount / expectedCount) * 10000) / 100
      : 0;

    res.json({
      success: true,
      data: {
        total_students: parseInt(studentsRes.rows[0].count, 10),
        total_teachers: parseInt(teachersRes.rows[0].count, 10),
        total_classes: parseInt(classesRes.rows[0].count, 10),
        overall_attendance_rate: overallAttendanceRate,
        active_classes_today: parseInt(activeRes.rows[0].count, 10),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users
 * List all users. Supports optional ?role=student|teacher|admin filter.
 */
router.get('/users', async (req, res, next) => {
  try {
    const { role } = req.query;
    const validRoles = ['student', 'teacher', 'admin'];

    let sql = 'SELECT id, name, email, role, created_at FROM users';
    const params = [];

    if (role) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role filter. Use student, teacher, or admin.' });
      }
      sql += ' WHERE role = $1';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/attendance/report
 * Per-class attendance report sorted by attendance rate ascending (worst first).
 */
router.get('/attendance/report', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         c.id AS class_id,
         c.name AS class_name,
         u.name AS teacher_name,
         enrolled.enrolled_count,
         CASE
           WHEN enrolled.enrolled_count = 0 OR att.distinct_dates = 0 THEN 0
           ELSE ROUND(
             att.actual_count::numeric
             / (enrolled.enrolled_count * att.distinct_dates) * 100,
             2
           )
         END AS attendance_rate
       FROM classes c
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN LATERAL (
         SELECT COUNT(DISTINCT e.student_id) AS enrolled_count
         FROM enrollments e
         WHERE e.class_id = c.id
       ) enrolled ON true
       LEFT JOIN LATERAL (
         SELECT
           COUNT(ar.id) AS actual_count,
           COUNT(DISTINCT ar.date) AS distinct_dates
         FROM attendance_records ar
         WHERE ar.class_id = c.id
       ) att ON true
       ORDER BY attendance_rate ASC`,
    );

    const data = result.rows.map((row) => ({
      class_id: row.class_id,
      class_name: row.class_name,
      teacher_name: row.teacher_name,
      enrolled_count: parseInt(row.enrolled_count, 10),
      attendance_rate: parseFloat(row.attendance_rate),
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
