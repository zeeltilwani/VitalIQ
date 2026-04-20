const db = require('./db');

async function runMigration() {
    try {
        console.log("Checking if meal_type column exists...");
        const result = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='food_logs' AND column_name='meal_type';
        `);

        if (result.rows.length === 0) {
            console.log("Adding meal_type column...");
            await db.query(`
                ALTER TABLE food_logs 
                ADD COLUMN meal_type VARCHAR(50) DEFAULT 'snacks';
            `);
            console.log("Migration successful: Added meal_type.");
        } else {
            console.log("Migration skipped: meal_type already exists.");
        }
        
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

runMigration();
