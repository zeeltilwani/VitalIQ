const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:5000/api';

async function verifyFullFlow() {
    console.log('=== VITALIQ END-TO-END VERIFICATION ===');

    try {
        // 1. REGISTER
        console.log('\n[1] Registering new user...');
        const email = `final_test_${Date.now()}@test.com`;
        const signupPayload = {
            email,
            password: 'SecurePassword123!',
            age: 28,
            weight: 75.5,
            height: 180,
            gender: 'male',
            activityLevel: 'active'
        };

        const signupRes = await axios.post(`${API_URL}/auth/signup`, signupPayload);
        if (signupRes.status !== 201) throw new Error('Signup failed');
        console.log(`PASS: Use registered (${email}).`);

        // 2. LOGIN
        console.log('\n[2] Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: signupPayload.email,
            password: signupPayload.password
        });
        const { token, user } = loginRes.data;
        if (!token || !user) throw new Error('Login failed: Missing token or user data');
        console.log('PASS: Login successful. Token received.');

        const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

        // 3. INITIAL DASHBOARD CHECK
        console.log('\n[3] Checking initial Dashboard stats...');
        const today = new Date().toISOString().split('T')[0];
        const dashRes1 = await axios.get(`${API_URL}/logs/summary`, {
            params: { userId: user.id, date: today },
            ...authHeaders
        });
        console.log(`Stats: Calories=${dashRes1.data.calories}, Water=${dashRes1.data.water}`);
        if (Number(dashRes1.data.calories) !== 0 || Number(dashRes1.data.water) !== 0) {
            console.warn('WARNING: Dashboard not empty for new user.');
        } else {
            console.log('PASS: Initial dashboard empty.');
        }

        // 4. LOG FOOD (Simulate Camera)
        console.log('\n[4] Logging Food (Apple)...');
        const foodRes = await axios.post(`${API_URL}/logs/food`, {
            userId: user.id,
            foodName: 'Apple',
            calories: 95,
            macronutrients: { carbs: 25, protein: 0.5 },
            imageUrl: 'http://fake-url.com/apple.jpg'
        }, authHeaders);
        if (foodRes.status !== 201) throw new Error('Food logging failed');
        console.log('PASS: Food logged.');

        // 5. LOG WATER
        console.log('\n[5] Logging Water (500ml)...');
        const waterRes = await axios.post(`${API_URL}/logs/water`, {
            userId: user.id,
            amountMl: 500
        }, authHeaders);
        if (waterRes.status !== 201) throw new Error('Water logging failed');
        console.log('PASS: Water logged.');

        // 6. VERIFY DASHBOARD UPDATE
        console.log('\n[6] Verifying Dashboard Updates...');
        const dashRes2 = await axios.get(`${API_URL}/logs/summary`, {
            params: { userId: user.id, date: today },
            ...authHeaders
        });
        console.log(`Updated Stats: Calories=${dashRes2.data.calories}, Water=${dashRes2.data.water}`);

        if (Number(dashRes2.data.calories) === 95 && Number(dashRes2.data.water) === 500) {
            console.log('PASS: Dashboard updated correctly.');
        } else {
            throw new Error(`Dashboard mismatch! Expected 95/500, got ${dashRes2.data.calories}/${dashRes2.data.water}`);
        }

        console.log('\n=== VERIFICATION SUCCESSFUL ===');
        process.exit(0);

    } catch (error) {
        console.error('\n!!! VERIFICATION FAILED !!!');
        if (error.response) {
            console.error(`API Error ${error.response.status}:`, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

verifyFullFlow();
