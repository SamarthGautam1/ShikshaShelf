const db = require('../db');

/**
 * Finds a student (role='student') by exact name match.
 * Returns the first match if multiple students share a name.
 * @param {string} name
 * @returns {Promise<{id: string, name: string} | null>}
 */
async function findStudentByName(name) {
  const result = await db.query(
    `SELECT id, name FROM users
     WHERE role = 'student' AND name = $1
     ORDER BY created_at ASC
     LIMIT 1`,
    [name],
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Inserts an attendance record for today (UTC). If one already exists for
 * (student_id, class_id, date), returns null — the unique constraint
 * combined with ON CONFLICT DO NOTHING makes this idempotent.
 *
 * @param {string} studentId
 * @param {string} classId
 * @param {'qr'|'face'} method
 * @returns {Promise<object|null>} the inserted row, or null if it already existed
 */
async function markAttendance(studentId, classId, method) {
  const result = await db.query(
    `INSERT INTO attendance_records (student_id, class_id, method)
     VALUES ($1, $2, $3)
     ON CONFLICT (student_id, class_id, date) DO NOTHING
     RETURNING *`,
    [studentId, classId, method],
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Builds a per-class attendance summary for a student.
 *
 * For each class the student is enrolled in:
 *   - total: count of distinct dates that class held attendance (matches
 *     the convention used by the teacher-side insights endpoint —
 *     COUNT(DISTINCT date) FROM attendance_records WHERE class_id = ...).
 *     Includes 'absent' rows so absences land in the denominator.
 *   - attended: count of attendance_records the student has for that class
 *     where method != 'absent'. 'absent' rows mark absences and must not
 *     count as attendance.
 *
 * @param {string} studentId
 * @returns {Promise<Array<{class_id: string, class_name: string, attended: number, total: number}>>}
 */
async function getStudentAttendanceSummary(studentId) {
  const result = await db.query(
    `SELECT
       c.id   AS class_id,
       c.name AS class_name,
       COALESCE(class_dates.total_classes_held, 0) AS total,
       COUNT(*) FILTER (WHERE ar.id IS NOT NULL AND ar.method != 'absent') AS attended
     FROM enrollments e
     JOIN classes c ON c.id = e.class_id
     LEFT JOIN (
       SELECT class_id, COUNT(DISTINCT date) AS total_classes_held
       FROM attendance_records
       GROUP BY class_id
     ) class_dates ON class_dates.class_id = c.id
     LEFT JOIN attendance_records ar
       ON ar.class_id = c.id AND ar.student_id = $1
     WHERE e.student_id = $1
     GROUP BY c.id, c.name, class_dates.total_classes_held
     ORDER BY c.name`,
    [studentId],
  );

  return result.rows.map((row) => ({
    class_id: row.class_id,
    class_name: row.class_name,
    attended: parseInt(row.attended, 10),
    total: parseInt(row.total, 10),
  }));
}

/**
 * Inserts an 'absent' attendance record for every student enrolled in
 * `classId` who has no attendance_records row for today (CURRENT_DATE, UTC
 * at the DB). Relies on the (student_id, class_id, date) unique constraint
 * plus a NOT EXISTS guard so concurrent calls stay idempotent.
 *
 * @param {string} classId
 * @returns {Promise<Array<{student_id: string, name: string}>>}
 *   The freshly-inserted absences, each joined with the student's name.
 */
async function markAbsentForSession(classId) {
  const result = await db.query(
    `WITH inserted AS (
       INSERT INTO attendance_records (student_id, class_id, date, method, marked_at)
       SELECT e.student_id, e.class_id, CURRENT_DATE, 'absent', now()
       FROM enrollments e
       WHERE e.class_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM attendance_records ar
           WHERE ar.student_id = e.student_id
             AND ar.class_id = e.class_id
             AND ar.date = CURRENT_DATE
         )
       RETURNING student_id
     )
     SELECT i.student_id, u.name
     FROM inserted i
     JOIN users u ON u.id = i.student_id
     ORDER BY u.name`,
    [classId],
  );

  return result.rows.map((row) => ({
    student_id: row.student_id,
    name: row.name,
  }));
}

/**
 * Upserts a manual attendance record for (student_id, class_id, date).
 * Existing rows (e.g. an 'absent' written by session-close, or a stale
 * 'manual' entry) are overwritten with the new method and marked_at.
 *
 * @param {string} studentId
 * @param {string} classId
 * @param {string} date  YYYY-MM-DD
 * @param {'manual'|'absent'} method
 * @returns {Promise<object>} the inserted or updated row
 */
async function upsertManualAttendance(studentId, classId, date, method) {
  const result = await db.query(
    `INSERT INTO attendance_records (student_id, class_id, date, method, marked_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (student_id, class_id, date)
     DO UPDATE SET method = EXCLUDED.method, marked_at = now()
     RETURNING *`,
    [studentId, classId, date, method],
  );
  return result.rows[0];
}

module.exports = {
  findStudentByName,
  markAttendance,
  getStudentAttendanceSummary,
  markAbsentForSession,
  upsertManualAttendance,
};
