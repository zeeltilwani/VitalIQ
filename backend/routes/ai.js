const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const authenticateToken = require('../middleware/authMiddleware');
const foods = require('../data/foods.json');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

// ✅ TASK 3: AI FOOD SCAN (FIXED)
router.post('/identify', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname || 'upload.jpg',
            contentType: req.file.mimetype,
        });

        let detectedLabel = 'Unknown';
        let confidence = 0;

        // 1. Try Python ML Model
        try {
            const aiRes = await axios.post('http://localhost:8000/predict', form, {
                headers: { ...form.getHeaders() },
                timeout: 30000, // Increased to 30s for Vision AI
            });
            if (aiRes.data && aiRes.data.label) {
                detectedLabel = aiRes.data.label;
                confidence = aiRes.data.confidence || 0.5;
                calories = aiRes.data.calories || 100;
                console.log(`[AI] Model returned: ${detectedLabel} (${calories} kcal)`);
            }
        } catch (aiErr) {
            console.log("[AI] Python model failed or timed out. Error:", aiErr.message);
        }

        // 2. Matching with dataset (optional override)
        let finalLabel = detectedLabel;
        let finalCalories = calories;

        const foodKeys = Object.keys(foods);
        for (const key of foodKeys) {
            const lowerKey = key.toLowerCase();
            const lowerDetected = detectedLabel.toLowerCase();
            if (lowerDetected.includes(lowerKey) || lowerKey.includes(lowerDetected)) {
                finalLabel = key;
                finalCalories = foods[key];
                break;
            }
        }

        // 3. Return results
        if (finalLabel === 'Unknown') {
            return res.json({ success: false, error: "Please try a clearer picture." });
        }

        // Estimate macros based on standard distribution (20% protein, 50% carbs, 30% fat)
        // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
        const protein = Math.round((finalCalories * 0.20) / 4);
        const carbs = Math.round((finalCalories * 0.50) / 4);
        const fat = Math.round((finalCalories * 0.30) / 9);

        return res.json({
            success: true,
            label: finalLabel.charAt(0).toUpperCase() + finalLabel.slice(1),
            calories: finalCalories,
            macros: { protein, carbs, fat },
            confidence,
            items: [{ name: finalLabel, calories: finalCalories }]
        });

    } catch (err) {
        console.error('[AI Identify Error]', err);
        return res.status(500).json({ error: 'Internal server error during identification' });
    }
});

// ChatBot
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        // Simple dynamic responses for now
        let reply = `That sounds interesting! As your health guide, I recommend focusing on protein and fiber to stay full longer.`;
        if (message.toLowerCase().includes('hello')) reply = "Hello! I'm your VitalIQ assistant. How can I help you with your fitness goals today?";
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: 'Chatbot error' });
    }
});

module.exports = router;
