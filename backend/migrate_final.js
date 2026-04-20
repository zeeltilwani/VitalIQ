const db = require('./db');

async function migrate() {
    console.log('🚀 Starting Final Migration...');
    try {
        // Add role and daily_calorie_goal to users
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
            ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000,
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP,
            ADD COLUMN IF NOT EXISTS last_logged_date DATE;
        `);
        console.log('✅ Users table updated.');

        // Add meal_type to food_logs
        await db.query(`
            ALTER TABLE food_logs 
            ADD COLUMN IF NOT EXISTS meal_type VARCHAR(20) DEFAULT 'snacks';
        `);
        console.log('✅ Food logs table updated.');

        // Insert some default data for roles if needed
        // (Optional: you can manually update existing users to admin etc.)

        console.log('🎉 Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
