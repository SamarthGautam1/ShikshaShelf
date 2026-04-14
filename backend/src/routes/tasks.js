const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const tasksController = require('../controllers/tasks');

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

/**
 * GET /api/tasks/suggestions
 * Returns AI-generated task suggestions for the student's free periods today.
 */
router.get('/suggestions', tasksController.getSuggestions);

module.exports = router;
