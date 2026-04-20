const db = require('./db');

async function migrate() {
    console.log('🚀 Starting Auth & Onboard Migration...');
    try {
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS dob DATE,
            ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
            ADD COLUMN IF NOT EXISTS city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS state VARCHAR(100),
            ADD COLUMN IF NOT EXISTS target_weight DECIMAL(5, 2),
            ADD COLUMN IF NOT EXISTS temp_password_active BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;
        `);
        console.log('✅ Users table enhanced with profile and session fields.');
        console.log('🎉 Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
