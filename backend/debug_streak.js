const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const finalUserId = 1; // Assuming a user exists
    
    // reset streak
    await pool.query("UPDATE users SET current_streak = 1, last_logged_date = CURRENT_DATE - INTERVAL '1 day' WHERE id = $1", [finalUserId]);
    
    for (let i = 0; i < 3; i++) {
        const userRes = await pool.query('SELECT last_logged_date, current_streak FROM users WHERE id = $1', [finalUserId]);
        const userData = userRes.rows[0];
        
        console.log(`\nIteration ${i}:`, {
             db_last_logged_date: userData.last_logged_date,
             current_streak: userData.current_streak
        });

        let newStreak = userData.current_streak || 0;
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA');
        
        let lastDateStr = null;
        if (!userData.last_logged_date) {
            newStreak = 1;
        } else {
            const lastLog = new Date(userData.last_logged_date);
            lastDateStr = lastLog.toLocaleDateString('en-CA');

            if (lastDateStr === todayStr) {
                newStreak = userData.current_streak || 1;
                console.log(`Maintained! lastDateStr=${lastDateStr}, todayStr=${todayStr}`);
            } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toLocaleDateString('en-CA');

                if (lastDateStr === yesterdayStr) {
                    newStreak = (userData.current_streak || 0) + 1;
                    console.log(`Incremented! lastDateStr=${lastDateStr}, yesterdayStr=${yesterdayStr}`);
                } else {
                    newStreak = 1;
                    console.log(`Reset! lastDateStr=${lastDateStr}, yesterdayStr=${yesterdayStr}`);
                }
            }
        }
        
        await pool.query(
            'UPDATE users SET current_streak = $1, last_logged_date = $2 WHERE id = $3',
            [newStreak, todayStr, finalUserId]
        );
        console.log(`Updated to streak: ${newStreak}, date: ${todayStr}`);
    }
    pool.end();
}
run();
