const db = require('./db');

async function fixSchema() {
    console.log('🚀 Starting Schema Fix...');
    try {
        // 1. Fix password_hash length (bcrypt hashes are 60 chars, VARCHAR(255) is safe)
        console.log('Updating password_hash column length...');
        await db.query(`
            ALTER TABLE users 
            ALTER COLUMN password_hash TYPE VARCHAR(255);
        `);

        // 2. Add water_glasses column if it doesn't exist
        console.log('Adding water_glasses column...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS water_glasses INTEGER DEFAULT 0;
        `);

        // 3. Add daily_water_goal if it doesn't exist
        console.log('Adding daily_water_goal column...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS daily_water_goal INTEGER DEFAULT 8;
        `);

        console.log('✅ Schema fixed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Schema fix failed:', err);
        process.exit(1);
    }
}

fixSchema();
