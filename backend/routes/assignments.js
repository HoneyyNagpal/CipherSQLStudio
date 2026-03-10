const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// GET /api/assignments - list all assignments
router.get('/', assignmentController.listAssignments);

// GET /api/assignments/:id - get single assignment details
router.get('/:id', assignmentController.getAssignment);

// GET /api/assignments/:id/schema - get table schemas for this assignment
router.get('/:id/schema', assignmentController.getSchema);

// GET /api/assignments/:id/sample-data - get sample rows for each table
router.get('/:id/sample-data', assignmentController.getSampleData);

module.exports = router;
