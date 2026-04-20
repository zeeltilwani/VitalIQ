const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { calculateBMR, calculateTDEE } = require('../utils/health');

router.use(authenticateToken);

// --- Get Profile ---
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT id, name, email, role, daily_calorie_goal, current_streak, 
             is_onboarded, bmr, tdee, dob, pincode, city, state, height, weight, target_weight, gender, goal
             FROM users WHERE id = $1`,
            [userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// --- Update Calorie Goal ---
router.post('/goal', async (req, res) => {
    try {
        const { daily_calorie_goal } = req.body;
        const userId = req.user.id;

        if (daily_calorie_goal == null) return res.status(400).json({ error: 'Missing goal' });

        const result = await db.query(
            'UPDATE users SET daily_calorie_goal = $1 WHERE id = $2 RETURNING daily_calorie_goal',
            [parseInt(daily_calorie_goal), userId]
        );

        res.json({ message: 'Goal updated', goal: result.rows[0].daily_calorie_goal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating goal' });
    }
});

// --- Onboarding (Production Rebuild) ---
router.post('/onboarding', async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            age, dob, pincode, city, state, 
            height, weight, gender, goal, 
            target_weight, activity_level, medical_conditions 
        } = req.body;
        
        // Strict Validation
        if (!dob || !pincode || !height || !weight || !target_weight) {
            return res.status(400).json({ error: 'Core profile metrics are missing.' });
        }

        const bmr = calculateBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
        const tdee = calculateTDEE(bmr, activity_level);

        const result = await db.query(
            `UPDATE users 
             SET age=$1, dob=$2, pincode=$3, city=$4, state=$5, 
                 height=$6, weight=$7, gender=$8, goal=$9, target_weight=$10, 
                 activity_level=$11, medical_conditions=$12, bmr=$13, tdee=$14, 
                 is_onboarded=true, last_logged_date=CURRENT_DATE, current_streak=1
             WHERE id=$15
             RETURNING id, name, email, is_onboarded, bmr, tdee`,
            [
                age, dob, pincode, city, state, 
                height, weight, gender, goal, target_weight, 
                activity_level, medical_conditions, bmr, tdee, userId
            ]
        );

        res.json({ message: 'Profile validated and saved.', user: result.rows[0] });
    } catch (err) {
        console.error('Onboarding Error:', err);
        res.status(500).json({ error: 'Internal server error saving profile.' });
    }
});

module.exports = router;
