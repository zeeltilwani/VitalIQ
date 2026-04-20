const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createDatabase() {
    // Connect to default 'postgres' database to create new db
    const connectionString = process.env.DATABASE_URL.replace('/vitaliq', '/postgres');
    const client = new Client({ connectionString });

    try {
        await client.connect();

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'vitaliq'");
        if (res.rowCount === 0) {
            console.log("Database 'vitaliq' not found. Creating...");
            await client.query('CREATE DATABASE vitaliq');
            console.log("Database 'vitaliq' created successfully.");
        } else {
            console.log("Database 'vitaliq' already exists.");
        }

    } catch (err) {
        console.error('Error creating database:', err.message);
    } finally {
        await client.end();
    }
}

createDatabase();
