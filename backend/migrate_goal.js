const db = require('./db');

async function runGoalMigration() {
    try {
        console.log("Checking if daily_calorie_goal column exists in users...");
        const result = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='daily_calorie_goal';
        `);

        if (result.rows.length === 0) {
            console.log("Adding daily_calorie_goal column...");
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN daily_calorie_goal INTEGER DEFAULT 2000;
            `);
            console.log("Migration successful: Added daily_calorie_goal with default 2000.");
        } else {
            console.log("Migration skipped: daily_calorie_goal already exists.");
        }
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

runGoalMigration();
