const TimetableModel = require('../models/timetable');

/**
 * GET /api/tasks/suggestions
 * Computes today's free periods for the logged-in student and proxies
 * the request to the AI service for personalised task suggestions.
 */
async function getSuggestions(req, res, next) {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can access task suggestions' });
    }

    // JS getDay(): 0=Sunday...6=Saturday. Convert to 0=Monday...4=Friday.
    const jsDay = new Date().getDay();
    const dayOfWeek = jsDay - 1;

    // Weekends — no suggestions
    if (dayOfWeek < 0 || dayOfWeek > 4) {
      return res.json({ success: true, data: { suggestions: [], message: 'No suggestions on weekends' } });
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

    if (freePeriods.length === 0) {
      return res.json({ success: true, data: { suggestions: [], message: 'No free periods today' } });
    }

    // Proxy request to the AI service
    let aiRes;
    try {
      aiRes = await fetch(`${process.env.AI_SERVICE_URL}/api/v1/task-suggestions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: req.user.id,
          free_periods: freePeriods,
          career_goal: 'Data Scientist',
        }),
      });
    } catch (_networkErr) {
      return res.status(502).json({ success: false, error: 'AI service unavailable' });
    }

    if (!aiRes.ok) {
      return res.status(502).json({ success: false, error: 'AI service unavailable' });
    }

    const aiBody = await aiRes.json();
    return res.json({ success: true, data: aiBody.data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSuggestions,
};
