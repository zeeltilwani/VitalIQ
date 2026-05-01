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
                timeout: 5000,
            });
            if (aiRes.data && aiRes.data.label) {
                detectedLabel = aiRes.data.label.toLowerCase().trim();
                confidence = aiRes.data.confidence || 0.5;
            }
        } catch (aiErr) {
            console.log("[AI] Python model failed, falling back to keyword detection...");
        }

        // 2. Matching with dataset (foods.json)
        // Convert detected label to lowercase and match
        let matchedFood = null;
        let calories = 0;

        const foodKeys = Object.keys(foods);
        for (const key of foodKeys) {
            if (detectedLabel.includes(key) || key.includes(detectedLabel)) {
                matchedFood = key;
                calories = foods[key];
                break;
            }
        }

        // 3. If NOT found in dataset, return error (DO NOT return fake calories)
        if (!matchedFood) {
            console.log(`[AI] Food "${detectedLabel}" not recognized in dataset.`);
            return res.json({ 
                success: false, 
                error: "Food not recognized",
                detected: detectedLabel // for debugging
            });
        }

        console.log(`[AI] Identified: ${matchedFood} (${calories} kcal)`);
        
        return res.json({
            success: true,
            label: matchedFood.charAt(0).toUpperCase() + matchedFood.slice(1),
            calories,
            confidence,
            items: [{ name: matchedFood, calories }]
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
