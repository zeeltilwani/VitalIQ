const db = require('./db');

async function runStreakMigration() {
    try {
        console.log("Checking if streak schema exists in users table...");
        
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_logged_date DATE,
            ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
        `);
        console.log("Migration successful: streak-tracking schema explicitly bounded to 0!");
        
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

runStreakMigration();
