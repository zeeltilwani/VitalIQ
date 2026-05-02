const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { estimateCalories } = require('../utils/calorieEstimator');

router.use(authenticateToken);

// Helper to normalize meal names
const normalizeMeal = (meal) => {
    if (!meal) return 'Snacks';
    const m = meal.toLowerCase().trim();
    if (m === 'breakfast') return 'Breakfast';
    if (m === 'lunch') return 'Lunch';
    if (m === 'dinner') return 'Dinner';
    return 'Snacks';
};

// --- Log Food (Part 3 & 8) ---
router.post('/food', async (req, res) => {
    try {
        const { userId, foodName, mealType = 'Snacks', imageUrl, portionMultiplier = 1 } = req.body;
        const finalUserId = userId || req.user.id;

        if (!foodName || !foodName.trim()) {
            return res.status(400).json({ success: false, error: 'Food name is required' });
        }

        // Part 3: Food Validation & Calorie Resolution
        let calories = req.body.calories;
        
        if (calories === undefined || calories === null) {
            const calorieResult = estimateCalories(foodName);
            if (calorieResult && typeof calorieResult === 'object' && calorieResult.error) {
                // DO NOT log if food not recognized and no calories provided
                console.log(`[Logs] Blocked logging of unrecognized food: "${foodName}"`);
                return res.status(400).json({ success: false, error: "Food not recognized in our database. Please try a different name." });
            }
            calories = typeof calorieResult === 'number' ? calorieResult : 0;
        }

        if (portionMultiplier !== 1) {
            calories = Math.round(calories * portionMultiplier);
        }

        const date = new Date().toISOString().split('T')[0];
        const standardizedMeal = normalizeMeal(mealType);

        // Insert log
        const newLog = await db.query(
            'INSERT INTO food_logs (user_id, food_name, calories, meal_type, image_url, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [finalUserId, foodName.trim(), calories, standardizedMeal, imageUrl || null, date]
        );

        // --- Part 8: Atomic Streak Fix ---
        // Using Postgres to atomically evaluate the streak to prevent race conditions and JS timezone bugs.
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
        
        const streakRes = await db.query(streakUpdateQuery, [finalUserId]);
        const newStreak = streakRes.rows[0].current_streak;

        console.log(`🔥 Streak for user ${finalUserId}: ${newStreak} (Last: ${streakRes.rows[0].last_logged_date})`);

        res.status(201).json({
            success: true,
            data: newLog.rows[0],
            streak: newStreak
        });
    } catch (err) {
        console.error('[Food Log Error]', err);
        res.status(500).json({ success: false, error: 'Server error logging food' });
    }
});

// --- Remaining routes (Grouped, Summary, Trend, Water) ---
router.get('/food', async (req, res) => {
    try {
        const { userId, date } = req.query;
        const finalUserId = userId || req.user.id;
        const targetDate = date || new Date().toISOString().split('T')[0];
        const logs = await db.query('SELECT * FROM food_logs WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC', [finalUserId, targetDate]);
        const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
        logs.rows.forEach(log => {
            const mt = normalizeMeal(log.meal_type);
            if (grouped[mt]) grouped[mt].push(log);
            else grouped.Snacks.push(log);
        });
        res.json(grouped);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching food logs' });
    }
});

router.get('/summary', async (req, res) => {
    try {
        const { userId, date } = req.query;
        const finalUserId = userId || req.user.id;
        const targetDate = date || new Date().toISOString().split('T')[0];
        const foodRes = await db.query('SELECT SUM(calories) as total FROM food_logs WHERE user_id = $1 AND date = $2', [finalUserId, targetDate]);
        const waterRes = await db.query('SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = $1 AND date = $2', [finalUserId, targetDate]);
        res.json({
            calories: parseInt(foodRes.rows[0].total) || 0,
            water: parseInt(waterRes.rows[0].total) || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching summary' });
    }
});

router.get('/trend', async (req, res) => {
    try {
        const { userId } = req.query;
        const finalUserId = userId || req.user.id;
        const result = await db.query(`SELECT date, SUM(calories) as calories FROM food_logs WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 days' GROUP BY date ORDER BY date ASC`, [finalUserId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching trend' });
    }
});

router.post('/water', async (req, res) => {
    try {
        const { userId, amountMl } = req.body;
        const finalUserId = userId || req.user.id;
        const date = new Date().toISOString().split('T')[0];
        const newLog = await db.query('INSERT INTO water_logs (user_id, amount_ml, date) VALUES ($1, $2, $3) RETURNING *', [finalUserId, amountMl, date]);
        res.status(201).json({ success: true, data: newLog.rows[0] });
    } catch (err) {
        console.error('[Water Log Error]', err);
        res.status(500).json({ success: false, error: 'Error logging water' });
    }
});

// --- Delete Food Log ---
router.delete('/food/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await db.query('DELETE FROM food_logs WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Food log not found or unauthorized' });
        }
        res.json({ success: true, message: 'Food log deleted' });
    } catch (err) {
        console.error('[Delete Food Log Error]', err);
        res.status(500).json({ success: false, error: 'Server error deleting food log' });
    }
});

module.exports = router;
