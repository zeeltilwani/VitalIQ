const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
    // Insert a dummy user
    const resUser = await pool.query("INSERT INTO users (name, email, password_hash) VALUES ('Test', 'teststreak@test.com', 'pwd') RETURNING id");
    const userId = resUser.rows[0].id;
    
    // Define the query exactly as in logs.js
    const streakUpdateQuery = `
        UPDATE users 
        SET 
          current_streak = CASE 
              WHEN last_logged_date IS NULL THEN 1
              WHEN last_logged_date = CURRENT_DATE THEN COALESCE(current_streak, 1)
              WHEN last_logged_date = CURRENT_DATE - INTERVAL '1 day' THEN COALESCE(current_streak, 0) + 1 
              ELSE 1 
          END,
          last_logged_date = CURRENT_DATE
        WHERE id = $1
        RETURNING current_streak, last_logged_date
    `;

    // First log (null -> 1)
    let res = await pool.query(streakUpdateQuery, [userId]);
    console.log("Log 1 (First ever):", res.rows[0].current_streak);

    // Second log same day (1 -> 1)
    res = await pool.query(streakUpdateQuery, [userId]);
    console.log("Log 2 (Same day):", res.rows[0].current_streak);

    // Simulate yesterday
    await pool.query("UPDATE users SET last_logged_date = CURRENT_DATE - INTERVAL '1 day' WHERE id = $1", [userId]);
    
    // Third log (yesterday -> 2)
    res = await pool.query(streakUpdateQuery, [userId]);
    console.log("Log 3 (Next day):", res.rows[0].current_streak);

    // Fourth log same day (2 -> 2)
    res = await pool.query(streakUpdateQuery, [userId]);
    console.log("Log 4 (Same next day):", res.rows[0].current_streak);

    // Simulate streak break (2 days ago)
    await pool.query("UPDATE users SET last_logged_date = CURRENT_DATE - INTERVAL '2 days' WHERE id = $1", [userId]);
    
    // Fifth log (broken -> 1)
    res = await pool.query(streakUpdateQuery, [userId]);
    console.log("Log 5 (Broken streak):", res.rows[0].current_streak);

    // Clean up
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    pool.end();
}
test();
