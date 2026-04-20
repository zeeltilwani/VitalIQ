const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

// AI Identification (Food)
router.post('/identify', upload.single('image'), async (req, res) => {
    try {
        // High-confidence mock for demo
        res.json({
            label: "Chicken Salad",
            calories: 320,
            confidence: 0.96,
            message: "Identified! This looks like a healthy choice."
        });
    } catch (err) {
        res.status(500).json({ error: 'AI identification failed' });
    }
});

// Context-Aware ChatBot
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        // Fetch User Context for Personalized Response
        const userRes = await db.query('SELECT name, age, height, weight, goal, city FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        let reply = "";
        const m = message.toLowerCase();

        if (m.includes('hello') || m.includes('hi')) {
            reply = `Hello ${user.name.split(' ')[0]}! How's the weather in ${user.city || 'your city'} today? I'm ready to help with your ${user.goal} journey.`;
        } else if (m.includes('weight') || m.includes('goal')) {
            reply = `Your current weight is ${user.weight}kg with a goal of "${user.goal}". To stay on track, consistency in logging is key!`;
        } else if (m.includes('water')) {
            const recommended = Math.round(user.weight * 0.033 * 10) / 10;
            reply = `Based on your weight of ${user.weight}kg, I recommend drinking about ${recommended} liters of water daily.`;
        } else if (m.includes('calorie')) {
            reply = `Monitoring calories for your "${user.goal}" goal will help you reach your target weight faster. What did you eat today?`;
        } else {
            reply = `That's interesting! As your health guide, I'm focused on helping you reach your ${user.goal} target. Would you like to log a meal or check your stats?`;
        }

        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Chatbot context error' });
    }
});

module.exports = router;
