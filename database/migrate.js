require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Runs all .sql migration files in order against the database.
 * Uses a schema_migrations table to track which files have already been applied,
 * making it safe to run multiple times (idempotent).
 */
async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Create tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename varchar(255) PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Find which migrations have already run
    const { rows: applied } = await client.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(applied.map((r) => r.filename));

    // Read and sort migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  skip: ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  done: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }

    console.log('All migrations applied.');
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
