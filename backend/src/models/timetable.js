const db = require('../db');

/**
 * Fetches all timetable entries for a given class, ordered by day and start time.
 * @param {string} classId - UUID of the class
 * @returns {Promise<import('pg').QueryResult>}
 */
function getByClassId(classId) {
  return db.query(
    `SELECT id, class_id, day_of_week, start_time, end_time, room, created_at, updated_at
     FROM timetable_entries
     WHERE class_id = $1
     ORDER BY day_of_week, start_time`,
    [classId],
  );
}

/**
 * Inserts a new timetable entry.
 * @param {{ classId: string, dayOfWeek: number, startTime: string, endTime: string, room: string }} entry
 * @returns {Promise<import('pg').QueryResult>}
 */
function create({ classId, dayOfWeek, startTime, endTime, room }) {
  return db.query(
    `INSERT INTO timetable_entries (class_id, day_of_week, start_time, end_time, room)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [classId, dayOfWeek, startTime, endTime, room],
  );
}

/**
 * Deletes a timetable entry by ID.
 * @param {string} entryId - UUID of the timetable entry
 * @returns {Promise<import('pg').QueryResult>}
 */
function deleteById(entryId) {
  return db.query(
    'DELETE FROM timetable_entries WHERE id = $1 RETURNING id',
    [entryId],
  );
}

/**
 * Fetches today's timetable entries for a student via their enrollments.
 * @param {string} studentId - UUID of the student
 * @param {number} dayOfWeek - 0 (Monday) through 4 (Friday)
 * @returns {Promise<import('pg').QueryResult>}
 */
function getStudentEntriesForDay(studentId, dayOfWeek) {
  return db.query(
    `SELECT te.id, te.class_id, te.day_of_week, te.start_time, te.end_time, te.room,
            c.name AS class_name, c.subject
     FROM timetable_entries te
     JOIN enrollments e ON e.class_id = te.class_id
     JOIN classes c ON c.id = te.class_id
     WHERE e.student_id = $1
       AND te.day_of_week = $2
     ORDER BY te.start_time`,
    [studentId, dayOfWeek],
  );
}

module.exports = {
  getByClassId,
  create,
  deleteById,
  getStudentEntriesForDay,
};
