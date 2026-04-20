const db = require('./db');

async function runOnboardingMigration() {
    try {
        console.log("Injecting Premium Onboarding schemas into PostgreSQL `users`...");
        
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS city VARCHAR(255),
            ADD COLUMN IF NOT EXISTS goal VARCHAR(50),
            ADD COLUMN IF NOT EXISTS target_weight FLOAT,
            ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50),
            ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
            ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;
        `);

        // To ensure legacy functionality persists: We must drop any strict NOT NULL bounds
        // applied to biological fields so partial register phases execute correctly.
        console.log("Removing NOT NULL hard constraints from telemetry to allow pure 3-phase Signup...");
        const columnsToRelax = ['age', 'weight', 'height', 'tdee', 'bmr'];
        for (const col of columnsToRelax) {
            try {
                await db.query(`ALTER TABLE users ALTER COLUMN ${col} DROP NOT NULL;`);
            } catch (err) {
                // If it wasn't NOT NULL, PG will throw, so we catch silently
            }
        }
        
        // Ensure legacy users don't get trapped if they previously logged via standard system
        await db.query(`UPDATE users SET is_onboarded = TRUE WHERE age IS NOT NULL AND is_onboarded = FALSE;`);

        console.log("Migration successful: Premium onboarding architecture mapped!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

runOnboardingMigration();
