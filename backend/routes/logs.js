const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { estimateCalories } = require('../utils/calorieEstimator');

router.use(authenticateToken);

// Helper to normalize meal names to match Frontend "Breakfast, Lunch, Dinner, Snacks"
const normalizeMeal = (meal) => {
    if (!meal) return 'Snacks';
    const m = meal.toLowerCase().trim();
    if (m === 'breakfast') return 'Breakfast';
    if (m === 'lunch') return 'Lunch';
    if (m === 'dinner') return 'Dinner';
    return 'Snacks';
};

// --- Log Food ---
router.post('/food', async (req, res) => {
    try {
        const { userId, foodName, mealType = 'Snacks', imageUrl } = req.body;
        const finalUserId = userId || req.user.id;

        if (!foodName) return res.status(400).json({ error: 'Food name is required' });

        const calories = estimateCalories(foodName);
        const date = new Date().toISOString().split('T')[0];
        const standardizedMeal = normalizeMeal(mealType);

        const newLog = await db.query(
            'INSERT INTO food_logs (user_id, food_name, calories, meal_type, image_url, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [finalUserId, foodName, calories, standardizedMeal, imageUrl, date]
        );

        // Update streak
        await db.query(`
            UPDATE users SET 
            last_logged_date = CURRENT_DATE,
            current_streak = CASE 
                WHEN last_logged_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
                WHEN last_logged_date = CURRENT_DATE THEN current_streak
                ELSE 1
            END
            WHERE id = $1
        `, [finalUserId]);

        res.status(201).json(newLog.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error logging food' });
    }
});

// --- Get Food Logs (Grouped) ---
router.get('/food', async (req, res) => {
    try {
        const { userId, date } = req.query;
        const finalUserId = userId || req.user.id;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const logs = await db.query(
            'SELECT * FROM food_logs WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC',
            [finalUserId, targetDate]
        );

        // Strict grouping matching exactly what React Native Dashboard expects
        const grouped = {
            Breakfast: [],
            Lunch: [],
            Dinner: [],
            Snacks: []
        };

        logs.rows.forEach(log => {
            const mt = normalizeMeal(log.meal_type);
            if (grouped[mt]) {
                grouped[mt].push(log);
            } else {
                grouped.Snacks.push(log);
            }
        });

        res.json(grouped);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching food logs' });
    }
});

// --- Summary (Calories vs Goal) ---
router.get('/summary', async (req, res) => {
    try {
        const { userId, date } = req.query;
        const finalUserId = userId || req.user.id;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const foodRes = await db.query(
            'SELECT SUM(calories) as total FROM food_logs WHERE user_id = $1 AND date = $2',
            [finalUserId, targetDate]
        );
        
        const waterRes = await db.query(
            'SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = $1 AND date = $2',
            [finalUserId, targetDate]
        );

        res.json({
            calories: parseInt(foodRes.rows[0].total) || 0,
            water: parseInt(waterRes.rows[0].total) || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching summary' });
    }
});

// --- Trend (Daily sums) ---
router.get('/trend', async (req, res) => {
    try {
        const { userId } = req.query;
        const finalUserId = userId || req.user.id;
        
        const result = await db.query(`
            SELECT date, SUM(calories) as calories 
            FROM food_logs 
            WHERE user_id = $1 
            AND date >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY date 
            ORDER BY date ASC
        `, [finalUserId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching trend' });
    }
});

// --- Water Log ---
router.post('/water', async (req, res) => {
    try {
        const { userId, amountMl } = req.body;
        const finalUserId = userId || req.user.id;
        const date = new Date().toISOString().split('T')[0];

        const newLog = await db.query(
            'INSERT INTO water_logs (user_id, amount_ml, date) VALUES ($1, $2, $3) RETURNING *',
            [finalUserId, amountMl, date]
        );
        res.status(201).json(newLog.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging water' });
    }
});

module.exports = router;
