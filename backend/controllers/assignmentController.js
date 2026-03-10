const ASSIGNMENTS = require('../utils/assignments');
const { adminPool } = require('../config/postgres');

const listAssignments = (req, res) => {
  // Return assignment list without the full question text (for card preview)
  const summary = ASSIGNMENTS.map(a => ({
    id: a.id,
    title: a.title,
    difficulty: a.difficulty,
    tags: a.tags,
    description: a.description,
    tableCount: a.tables.length,
  }));
  res.json({ assignments: summary });
};

const getAssignment = (req, res) => {
  const assignment = ASSIGNMENTS.find(a => a.id === req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }
  res.json({ assignment });
};

/**
 * Returns column definitions for each table in the assignment.
 * Students use this to understand the schema before writing queries.
 */
const getSchema = async (req, res) => {
  const assignment = ASSIGNMENTS.find(a => a.id === req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  try {
    const schemas = {};

    for (const tableName of assignment.tables) {
      // Query information_schema to get column details
      const result = await adminPool.query(
        `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      );
      schemas[tableName] = result.rows;
    }

    res.json({ schemas });
  } catch (err) {
    console.error('Schema fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch table schemas.' });
  }
};

/**
 * Returns a few sample rows from each table so students can see the data shape.
 * Limits to 5 rows per table to keep response small.
 */
const getSampleData = async (req, res) => {
  const assignment = ASSIGNMENTS.find(a => a.id === req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  try {
    const sampleData = {};

    for (const tableName of assignment.tables) {
      // Only allow known table names to prevent injection via URL params
      // (The assignment.tables list is defined server-side, not from user input)
      const result = await adminPool.query(
        `SELECT * FROM "${tableName}" LIMIT 5`
      );
      sampleData[tableName] = {
        columns: result.fields.map(f => f.name),
        rows: result.rows,
        totalRows: result.rowCount,
      };
    }

    res.json({ sampleData });
  } catch (err) {
    console.error('Sample data fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sample data.' });
  }
};

module.exports = { listAssignments, getAssignment, getSchema, getSampleData };
