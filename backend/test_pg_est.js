const { Pool } = require('pg');
require('dotenv').config();

// Force timezone to EST
process.env.TZ = 'America/New_York';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
    await pool.query("CREATE TABLE IF NOT EXISTS test_date_table (d DATE)");
    await pool.query("INSERT INTO test_date_table VALUES ('2026-05-01')");
    
    const res = await pool.query("SELECT d FROM test_date_table LIMIT 1");
    console.log("Returned from DB:", res.rows[0].d);
    console.log("As en-CA local:", res.rows[0].d.toLocaleDateString('en-CA'));
    
    // Test what new Date(userData.last_logged_date) does
    const lastLog = new Date(res.rows[0].d);
    console.log("lastLog en-CA local:", lastLog.toLocaleDateString('en-CA'));
    
    await pool.query("DROP TABLE test_date_table");
    pool.end();
}
test();
