const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDb() {
    const connectionString = process.env.DATABASE_URL;
    // We first connect to 'postgres' to make sure 'vitaliq' database exists
    const baseConnectionString = connectionString.replace('/vitaliq', '/postgres');

    const client = new Client({ connectionString: baseConnectionString });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL server.');

        // 1. Create Database if not exists
        const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'vitaliq'");
        if (dbRes.rowCount === 0) {
            console.log("Database 'vitaliq' does not exist. Creating...");
            await client.query('CREATE DATABASE vitaliq');
            console.log("Database 'vitaliq' created.");
        } else {
            console.log("Database 'vitaliq' already exists.");
        }
        await client.end();

        // 2. Connect to 'vitaliq' and run init.sql
        const vitaliqClient = new Client({ connectionString });
        await vitaliqClient.connect();
        console.log("Connected to 'vitaliq' database.");

        const sqlPath = path.join(__dirname, '../db/init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Running init.sql...");
        await vitaliqClient.query(sql);
        console.log("✅ Tables created/verified successfully!");

        // 3. Run extra migrations for new columns
        console.log("Running final migrations...");
        try {
            await vitaliqClient.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS name VARCHAR(255),
                ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
                ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
                ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false,
                ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS dob DATE,
                ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
                ADD COLUMN IF NOT EXISTS city VARCHAR(100),
                ADD COLUMN IF NOT EXISTS state VARCHAR(100),
                ADD COLUMN IF NOT EXISTS target_weight DECIMAL(5,2),
                ADD COLUMN IF NOT EXISTS goal VARCHAR(50),
                ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50),
                ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
                ADD COLUMN IF NOT EXISTS water_glasses INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS daily_water_goal INTEGER DEFAULT 8,
                ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000,
                ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
                ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP,
                ADD COLUMN IF NOT EXISTS last_logged_date DATE;

                ALTER TABLE food_logs 
                ADD COLUMN IF NOT EXISTS meal_type VARCHAR(20) DEFAULT 'snacks';
            `);
            console.log("✅ All migrations applied.");
        } catch (mErr) {
            console.log("Note: Some columns might already exist, which is fine.");
        }

        await vitaliqClient.end();
        console.log("🎉 Database initialization complete!");
        process.exit(0);

    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        process.exit(1);
    }
}

initDb();