const db = require('./db');

async function run() {
  try {
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS age INTEGER,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS height FLOAT,
      ADD COLUMN IF NOT EXISTS weight FLOAT,
      ADD COLUMN IF NOT EXISTS gender TEXT,
      ADD COLUMN IF NOT EXISTS goal TEXT,
      ADD COLUMN IF NOT EXISTS target_weight FLOAT,
      ADD COLUMN IF NOT EXISTS activity_level TEXT,
      ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
      ADD COLUMN IF NOT EXISTS bmr FLOAT,
      ADD COLUMN IF NOT EXISTS tdee FLOAT;
    `);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
