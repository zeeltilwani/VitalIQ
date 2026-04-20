const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:5000/api';

async function testLogging() {
    try {
        console.log('--- 1. Logging in to get Token ---');
        // Register a unique user for this test run to avoid conflicts
        const email = `logger_${Date.now()}@test.com`;
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password: 'password123',
            age: 30,
            weight: 80,
            height: 180,
            gender: 'male',
            activityLevel: 'active'
        });

        const token = signupRes.data.token;
        const userId = signupRes.data.user.id;
        console.log(`User created. ID: ${userId}, Token obtained.`);

        console.log('--- 2. Testing Food Log (Protected) ---');
        const foodRes = await axios.post(`${API_URL}/logs/food`, {
            userId, // Note: In a real app, userId should probably come from the token, not the body, for security.
            foodName: 'Banana',
            calories: 105,
            macronutrients: { carbs: 27, protein: 1.3 },
            imageUrl: 'http://example.com/banana.jpg'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Food Log Success:', foodRes.status, foodRes.data.food_name);

        console.log('--- 3. Testing Water Log (Protected) ---');
        const waterRes = await axios.post(`${API_URL}/logs/water`, {
            userId,
            amountMl: 250
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Water Log Success:', waterRes.status, waterRes.data.amount_ml, 'ml');

        console.log('--- 4. Testing Summary (Protected) ---');
        const today = new Date().toISOString().split('T')[0];
        const summaryRes = await axios.get(`${API_URL}/logs/summary?userId=${userId}&date=${today}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Summary Success:', summaryRes.status, summaryRes.data);

        console.log('--- ALL LOGGING TESTS PASSED ---');

    } catch (err) {
        if (err.response) {
            console.error('API Error:', err.response.status, err.response.data);
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    }
}

testLogging();
