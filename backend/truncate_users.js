const db = require('./db');

async function cleanDevelopmentData() {
    try {
        console.log("Connecting to PostgreSQL Development Database: vitaliq...");
        
        console.log("Executing SQL: TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
        await db.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
        
        console.log("Verifying data removal...");
        const result = await db.query(`SELECT COUNT(*) FROM users;`);
        
        console.log(`Success! Current rows inside 'users' table: ${result.rows[0].count}`);
        console.log("Schema structures and other disconnected tables remain completely untouched.");
    } catch (err) {
        console.error("Failed to execute development wipe:", err);
    } finally {
        process.exit();
    }
}

cleanDevelopmentData();
