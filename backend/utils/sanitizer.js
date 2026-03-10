/**
 * SQL Query Sanitizer
 * Prevents students from running destructive or unauthorized queries.
 * Students should only be able to run SELECT statements.
 */

// Commands that should never be allowed in student queries
const BLOCKED_KEYWORDS = [
  'DROP',
  'DELETE',
  'INSERT',
  'UPDATE',
  'CREATE',
  'ALTER',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'EXECUTE',
  'EXEC',
  'CALL',
  'DO',
  'COPY',
  'VACUUM',
  'ANALYZE',
  'EXPLAIN',  // Allow or block based on your preference
  'SET',
  'SHOW',
  'LOCK',
  'UNLISTEN',
  'LISTEN',
  'NOTIFY',
  'LOAD',
  'IMPORT',
];

/**
 * Strips SQL comments (both -- and /* style)
 * This prevents tricks like: SELECT 1; --DROP TABLE users
 */
const stripComments = (sql) => {
  // Remove single-line comments
  let cleaned = sql.replace(/--[^\n]*/g, '');
  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  return cleaned.trim();
};

/**
 * Checks if query contains any blocked keywords.
 * Uses word-boundary matching to avoid false positives.
 * e.g., "DROP" blocks it, but "raindrop" would not.
 */
const containsBlockedKeyword = (sql) => {
  const upperSql = sql.toUpperCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    // Word boundary check: keyword must be surrounded by non-word chars
    const pattern = new RegExp(`\\b${keyword}\\b`);
    if (pattern.test(upperSql)) {
      return keyword;
    }
  }
  return null;
};

/**
 * Detects multiple statements separated by semicolons.
 * We only allow one statement at a time.
 */
const hasMultipleStatements = (sql) => {
  // Remove string literals first to avoid false semicolons inside strings
  const withoutStrings = sql.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
  const statements = withoutStrings.split(';').filter(s => s.trim().length > 0);
  return statements.length > 1;
};

/**
 * Main sanitize function.
 * Returns { safe: true } or { safe: false, reason: string }
 */
const sanitizeQuery = (rawSql) => {
  if (!rawSql || typeof rawSql !== 'string') {
    return { safe: false, reason: 'Query must be a non-empty string.' };
  }

  const sql = rawSql.trim();

  if (sql.length === 0) {
    return { safe: false, reason: 'Query cannot be empty.' };
  }

  if (sql.length > 2000) {
    return { safe: false, reason: 'Query is too long (max 2000 characters).' };
  }

  // Strip comments before analysis
  const cleaned = stripComments(sql);

  if (cleaned.length === 0) {
    return { safe: false, reason: 'Query cannot be empty after removing comments.' };
  }

  // Check for multiple statements
  if (hasMultipleStatements(cleaned)) {
    return { safe: false, reason: 'Only one SQL statement is allowed at a time.' };
  }

  // Check for blocked keywords
  const blocked = containsBlockedKeyword(cleaned);
  if (blocked) {
    return {
      safe: false,
      reason: `Keyword "${blocked}" is not allowed. Only SELECT queries are permitted.`,
    };
  }

  // Must start with SELECT (after optional whitespace and WITH for CTEs)
  const firstWord = cleaned.replace(/\s+/g, ' ').trim().split(' ')[0].toUpperCase();
  if (firstWord !== 'SELECT' && firstWord !== 'WITH') {
    return {
      safe: false,
      reason: 'Only SELECT queries are allowed. Your query must begin with SELECT or WITH (for CTEs).',
    };
  }

  return { safe: true, cleanedSql: cleaned };
};

module.exports = { sanitizeQuery };
