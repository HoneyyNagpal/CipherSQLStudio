const { readerPool } = require('../config/postgres');
const { sanitizeQuery } = require('../utils/sanitizer');
const ASSIGNMENTS = require('../utils/assignments');
const Attempt = require('../models/Attempt');

/**
 * POST /api/query/execute
 * Body: { sql: string, assignmentId: string }
 */
const executeQuery = async (req, res) => {
  const { sql, assignmentId } = req.body;

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required.' });
  }

  // Verify the assignment exists
  const assignment = ASSIGNMENTS.find(a => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  // Sanitize the query
  const sanitizeResult = sanitizeQuery(sql);
  if (!sanitizeResult.safe) {
    return res.status(400).json({
      error: sanitizeResult.reason,
      type: 'VALIDATION_ERROR',
    });
  }

  const cleanedSql = sanitizeResult.cleanedSql;
  const startTime = Date.now();
  let wasSuccessful = false;
  let errorMessage = null;
  let rowCount = 0;

  try {
    // Execute on reader pool (limited PostgreSQL role)
    const result = await readerPool.query(cleanedSql);
    wasSuccessful = true;
    rowCount = result.rowCount || result.rows.length;

    const executionTime = Date.now() - startTime;

    // Columns from pg field metadata
    const columns = result.fields ? result.fields.map(f => f.name) : [];

    // Save attempt if user is logged in (non-blocking)
    if (req.userId) {
      Attempt.create({
        userId: req.userId,
        assignmentId,
        query: sql,
        wasSuccessful: true,
        rowCount,
      }).catch(err => console.error('Failed to save attempt:', err));
    }

    return res.json({
      success: true,
      columns,
      rows: result.rows,
      rowCount,
      executionTime,
    });

  } catch (pgError) {
    errorMessage = pgError.message;
    const executionTime = Date.now() - startTime;

    // Save failed attempt if user is logged in (non-blocking)
    if (req.userId) {
      Attempt.create({
        userId: req.userId,
        assignmentId,
        query: sql,
        wasSuccessful: false,
        errorMessage: pgError.message,
        rowCount: 0,
      }).catch(err => console.error('Failed to save attempt:', err));
    }

    return res.status(400).json({
      success: false,
      error: cleanPgError(pgError.message),
      type: 'QUERY_ERROR',
      executionTime,
    });
  }
};

/**
 * Cleans up PostgreSQL error messages to be more student-friendly.
 */
const cleanPgError = (rawMessage) => {
  // Remove internal position info that's confusing
  const cleaned = rawMessage
    .replace(/^ERROR:\s*/i, '')
    .replace(/\nLINE \d+:.*$/s, '')
    .replace(/\nHINT:.*$/s, '');
  return cleaned;
};

/**
 * GET /api/query/attempts/:assignmentId
 * Returns the last 10 attempts for this user + assignment
 */
const getAttempts = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const attempts = await Attempt.find({
      userId: req.userId,
      assignmentId,
    })
      .sort({ executedAt: -1 })
      .limit(10)
      .select('query wasSuccessful rowCount executedAt errorMessage');

    res.json({ attempts });
  } catch (err) {
    console.error('Get attempts error:', err);
    res.status(500).json({ error: 'Failed to fetch attempts.' });
  }
};

module.exports = { executeQuery, getAttempts };
