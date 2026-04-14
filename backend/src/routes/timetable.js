const { Router } = require('express');
const { param, body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const timetableController = require('../controllers/timetable');

const router = Router();

// All timetable routes require authentication
router.use(authMiddleware);

/**
 * GET /api/timetable/student/today
 * Returns today's timetable for the logged-in student, with free periods.
 */
router.get('/student/today', timetableController.getStudentToday);

/**
 * GET /api/timetable/class/:classId
 * Returns all timetable entries for a class.
 */
router.get(
  '/class/:classId',
  [param('classId').isUUID().withMessage('Invalid class ID')],
  timetableController.getClassTimetable,
);

/**
 * POST /api/timetable/class/:classId
 * Creates a new timetable entry. Teacher/admin only.
 */
router.post(
  '/class/:classId',
  [
    param('classId').isUUID().withMessage('Invalid class ID'),
    body('day_of_week')
      .isInt({ min: 0, max: 4 })
      .withMessage('day_of_week must be an integer between 0 (Monday) and 4 (Friday)'),
    body('start_time')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('start_time must be in HH:MM format'),
    body('end_time')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('end_time must be in HH:MM format'),
    body('room')
      .trim()
      .notEmpty()
      .withMessage('Room is required'),
    body('end_time').custom((endTime, { req }) => {
      if (req.body.start_time && endTime <= req.body.start_time) {
        throw new Error('end_time must be after start_time');
      }
      return true;
    }),
  ],
  timetableController.createEntry,
);

/**
 * DELETE /api/timetable/:entryId
 * Deletes a timetable entry. Teacher/admin only.
 */
router.delete(
  '/:entryId',
  [param('entryId').isUUID().withMessage('Invalid entry ID')],
  timetableController.deleteEntry,
);

module.exports = router;
