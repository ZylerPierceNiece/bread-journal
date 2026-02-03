import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/bread_journal',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('✓ Database connected successfully');
  }
});

// Initialize database with migrations
export async function initializeDatabase() {
  try {
    // Run migrations in order
    const migrations = [
      '001_create_tables.sql',
      '002_add_multiple_images.sql'
    ];

    for (const migration of migrations) {
      const migrationSQL = readFileSync(
        join(__dirname, `../migrations/${migration}`),
        'utf-8'
      );
      await pool.query(migrationSQL);
      console.log(`✓ Migration ${migration} completed`);
    }

    console.log('✓ Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

export default pool;
