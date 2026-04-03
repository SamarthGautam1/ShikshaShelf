const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Executes a SQL query against the connection pool.
 * @param {string} text - SQL query string
 * @param {Array} params - Parameterized values
 * @returns {Promise<import('pg').QueryResult>}
 */
function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
