const { validationResult } = require('express-validator');
const db = require('../db');
const TimetableModel = require('../models/timetable');

/**
 * GET /api/timetable/class/:classId
 * Returns all timetable entries for a class. Any authenticated user can access.
 */
async function getClassTimetable(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const result = await TimetableModel.getByClassId(req.params.classId);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/timetable/class/:classId
 * Creates a new timetable entry. Teacher or admin only.
 */
async function createEntry(req, res, next) {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can manage timetable entries' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    // Verify the class exists
    const cls = await db.query('SELECT id FROM classes WHERE id = $1', [req.params.classId]);
    if (cls.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const { day_of_week, start_time, end_time, room } = req.body;

    const result = await TimetableModel.create({
      classId: req.params.classId,
      dayOfWeek: day_of_week,
      startTime: start_time,
      endTime: end_time,
      room,
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/timetable/:entryId
 * Deletes a timetable entry. Teacher or admin only.
 */
async function deleteEntry(req, res, next) {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can manage timetable entries' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const result = await TimetableModel.deleteById(req.params.entryId);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/timetable/student/today
 * Returns today's timetable for the logged-in student, including free periods.
 */
async function getStudentToday(req, res, next) {
  try {
    // JS getDay(): 0=Sunday...6=Saturday. Convert to 0=Monday...4=Friday.
    const jsDay = new Date().getDay();
    const dayOfWeek = jsDay - 1; // 0=Mon, 1=Tue, ..., 4=Fri

    // Weekends — no classes
    if (dayOfWeek < 0 || dayOfWeek > 4) {
      return res.json({ success: true, data: { entries: [], freePeriods: [] } });
    }

    const result = await TimetableModel.getStudentEntriesForDay(req.user.id, dayOfWeek);
    const entries = result.rows;

    // Compute free periods (gaps between consecutive classes)
    const freePeriods = [];
    for (let i = 0; i < entries.length - 1; i++) {
      const currentEnd = entries[i].end_time;
      const nextStart = entries[i + 1].start_time;

      if (currentEnd < nextStart) {
        freePeriods.push({
          start_time: currentEnd,
          end_time: nextStart,
        });
      }
    }

    res.json({ success: true, data: { entries, freePeriods } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/timetable/teacher/today
 * Returns today's timetable entries across all classes the logged-in teacher
 * owns. Uses the same day_of_week mapping as getStudentToday (JS getDay()
 * minus 1, where 0=Monday … 4=Friday).
 */
async function getTeacherToday(req, res, next) {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, error: 'Only teachers can view their daily timetable' });
    }

    const jsDay = new Date().getDay();
    const dayOfWeek = jsDay - 1; // 0=Mon, 1=Tue, ..., 4=Fri

    // Weekends — no classes
    if (dayOfWeek < 0 || dayOfWeek > 4) {
      return res.json({ success: true, data: { entries: [] } });
    }

    const result = await TimetableModel.getTeacherEntriesForDay(req.user.id, dayOfWeek);
    res.json({ success: true, data: { entries: result.rows } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getClassTimetable,
  createEntry,
  deleteEntry,
  getStudentToday,
  getTeacherToday,
};
