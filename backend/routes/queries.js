const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const queryController = require('../controllers/queryController');

// POST /api/query/execute
router.post('/execute', optionalAuth, queryController.executeQuery);

// POST /api/query/explain
router.post('/explain', optionalAuth, queryController.explainQuery);

// GET /api/query/attempts/:assignmentId
router.get('/attempts/:assignmentId', optionalAuth, queryController.getAttempts);

module.exports = router;