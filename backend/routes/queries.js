const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const queryController = require('../controllers/queryController');

// POST /api/query/execute
// optionalAuth: saves attempt if logged in, still executes for guests
router.post('/execute', optionalAuth, queryController.executeQuery);

// GET /api/query/attempts/:assignmentId - get user's past attempts for an assignment
// Requires auth
const { protect } = require('../middleware/auth');
router.get('/attempts/:assignmentId', protect, queryController.getAttempts);

module.exports = router;
