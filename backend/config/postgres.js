const { Pool } = require('pg');

// Admin pool - used by backend for seeding and reading assignment metadata
const adminPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'honeynagpal',
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || 'ciphersql_sandbox',
  max: 10,
  idleTimeoutMillis: 30000,
});

// Read-only pool - used for executing student queries safely
// This connects as a limited PostgreSQL role that can only SELECT
const readerPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'honeynagpal',
  password: process.env.PG_READER_PASSWORD || process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || 'ciphersql_sandbox',
  max: 20,
  idleTimeoutMillis: 30000,
  // Short query timeout - prevent long-running queries from blocking
  statement_timeout: 5000, // 5 seconds max per query
});

const testPgConnection = async () => {
  try {
    const client = await adminPool.connect();
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL connected:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
  }
};

module.exports = { adminPool, readerPool, testPgConnection };
