const AttendanceModel = require('../models/attendance');
const db = require('../db');

/**
 * GET /api/attendance/me/summary
 * Student-only. Returns the logged-in student's overall attendance plus a
 * per-class breakdown.
 *
 * Shape:
 *   {
 *     total_classes,        // sum of distinct class dates across enrolled classes
 *     attended,             // sum of attendance records the student has
 *     percentage,           // attended / total_classes * 100 (0 when total is 0)
 *     per_class: [{ class_name, attended, total }]
 *   }
 */
async function getMyAttendanceSummary(req, res, next) {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can view their attendance summary' });
    }

    const perClassRows = await AttendanceModel.getStudentAttendanceSummary(req.user.id);

    let totalClasses = 0;
    let attended = 0;
    const perClass = perClassRows.map((row) => {
      totalClasses += row.total;
      attended += row.attended;
      return {
        class_name: row.class_name,
        attended: row.attended,
        total: row.total,
      };
    });

    const percentage = totalClasses > 0
      ? parseFloat(((attended / totalClasses) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        total_classes: totalClasses,
        attended,
        percentage,
        per_class: perClass,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/attendance/face/recognize
 * Teacher/admin-only. Proxies a captured image to the Flask AI service for
 * face recognition, then marks attendance for each recognized student who is
 * not yet marked for today. Emits a socket event per newly-marked student.
 */
async function recognizeFaces(req, res, next) {
  try {
    const { image_base64, class_id } = req.body;

    // Manual validation — matches the existing routes' style of returning the
    // unified {success:false, error} shape on 400.
    if (!image_base64 || typeof image_base64 !== 'string') {
      return res.status(400).json({ success: false, error: 'image_base64 is required' });
    }
    if (!class_id) {
      return res.status(400).json({ success: false, error: 'class_id is required' });
    }

    // Call the Flask AI service
    let aiRes;
    try {
      aiRes = await fetch(`${process.env.AI_SERVICE_URL}/api/v1/face-recognition/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64 }),
      });
    } catch (_networkErr) {
      return res.status(502).json({ success: false, error: 'AI service unavailable' });
    }

    if (!aiRes.ok) {
      return res.status(502).json({ success: false, error: 'AI service unavailable' });
    }

    const aiBody = await aiRes.json();
    const matches = (aiBody && aiBody.data && Array.isArray(aiBody.data.matches)) ? aiBody.data.matches : [];
    const unknownCount = (aiBody && aiBody.data && typeof aiBody.data.unknown_count === 'number')
      ? aiBody.data.unknown_count
      : 0;

    const io = req.app.get('io');
    const room = `attendance:${class_id}`;

    const recognized = [];

    for (const match of matches) {
      if (!match || typeof match.name !== 'string') continue;

      const student = await AttendanceModel.findStudentByName(match.name);
      if (!student) {
        // Recognized by the AI but no student record in our DB — include
        // in the response with a null student_id so the caller can surface it.
        recognized.push({ name: match.name, student_id: null, already_marked: false });
        continue;
      }

      const inserted = await AttendanceModel.markAttendance(student.id, class_id, 'face');

      if (inserted === null) {
        // Attendance was already present for today — no insert, no socket emit.
        recognized.push({ name: student.name, student_id: student.id, already_marked: true });
      } else {
        recognized.push({ name: student.name, student_id: student.id, already_marked: false });
        // Match QR flow's socket payload shape exactly.
        io.to(room).emit('attendance:marked', {
          studentName: student.name,
          markedAt: inserted.marked_at,
          student_id: student.id,
          class_id,
        });
      }
    }

    return res.json({
      success: true,
      data: {
        recognized,
        unknown_count: unknownCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/attendance/session/close
 * Teacher-only. Closes today's attendance session for a class by inserting
 * an 'absent' record for every enrolled student who wasn't already marked.
 * Emits `attendance:session-closed` to `attendance:<class_id>` with the
 * list of newly-absent students.
 */
async function closeSession(req, res, next) {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, error: 'Only teachers can close attendance sessions' });
    }

    const { class_id } = req.body;
    if (!class_id) {
      return res.status(400).json({ success: false, error: 'class_id is required' });
    }

    // Verify the class exists AND belongs to this teacher.
    const cls = await db.query(
      'SELECT id, teacher_id FROM classes WHERE id = $1',
      [class_id],
    );
    if (cls.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    if (cls.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this class' });
    }

    const absentStudents = await AttendanceModel.markAbsentForSession(class_id);

    const io = req.app.get('io');
    io.to(`attendance:${class_id}`).emit('attendance:session-closed', {
      class_id,
      absent_students: absentStudents,
    });

    return res.json({
      success: true,
      data: {
        absent_students: absentStudents,
        count: absentStudents.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/attendance/manual
 * Teacher or admin only. Upserts a single attendance record.
 *
 * Body: { student_id, class_id, date, status, method }
 *   - `status`: 'present' | 'absent'
 *   - `method`: must be 'manual' (rejected otherwise)
 *
 * Interpretation: status drives what goes into the `method` column —
 *   status='present' -> method='manual'
 *   status='absent'  -> method='absent'
 * This matches how session-close uses 'absent' as the absence marker
 * and keeps the `method` column meaningful for reporting.
 */
async function manualMark(req, res, next) {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can manually mark attendance' });
    }

    const { student_id, class_id, date, status, method } = req.body;

    if (!student_id) {
      return res.status(400).json({ success: false, error: 'student_id is required' });
    }
    if (!class_id) {
      return res.status(400).json({ success: false, error: 'class_id is required' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'date must be in YYYY-MM-DD format' });
    }
    if (status !== 'present' && status !== 'absent') {
      return res.status(400).json({ success: false, error: "status must be 'present' or 'absent'" });
    }
    if (method !== 'manual') {
      return res.status(400).json({ success: false, error: "method must be 'manual'" });
    }

    // Teachers can only mark for their own classes; admins bypass.
    if (req.user.role === 'teacher') {
      const cls = await db.query('SELECT teacher_id FROM classes WHERE id = $1', [class_id]);
      if (cls.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Class not found' });
      }
      if (cls.rows[0].teacher_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'You do not own this class' });
      }
    }

    // status -> stored method. 'present' is stored as 'manual' so that
    // real QR/face marks stay distinguishable from teacher overrides.
    const storedMethod = status === 'present' ? 'manual' : 'absent';

    const record = await AttendanceModel.upsertManualAttendance(
      student_id,
      class_id,
      date,
      storedMethod,
    );

    return res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recognizeFaces,
  getMyAttendanceSummary,
  closeSession,
  manualMark,
};
