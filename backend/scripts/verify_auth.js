const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const API_URL = 'http://localhost:5000/api/auth';

async function runUtility() {
    try {
        console.log('--- 1. Testing Database Connection ---');
        const res = await pool.query('SELECT NOW()');
        console.log('Database Connected:', res.rows[0].now);

        console.log('--- 2. Initializing Database Tables (details in init.sql) ---');
        const initSql = fs.readFileSync(path.resolve(__dirname, '../db/init.sql'), 'utf8');
        await pool.query(initSql);
        console.log('Tables initialized (if not existed).');

        console.log('--- 3. Testing Signup Route ---');
        const testUser = {
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            age: 25,
            weight: 70,
            height: 175,
            gender: 'male',
            activityLevel: 'moderate'
        };

        try {
            const signupRes = await axios.post(`${API_URL}/signup`, testUser);
            console.log('Signup Success:', signupRes.status, signupRes.data.user.email);

            // Verify JWT
            if (signupRes.data.token) {
                console.log('Token received.');
            }
        } catch (e) {
            if (e.response && e.response.data && e.response.data.error === 'User already exists') {
                console.log('User already exists (skipped)');
            } else {
                throw e;
            }
        }

        console.log('--- 4. Testing Login Route ---');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });

        console.log('Login Success:', loginRes.status);
        console.log('User ID:', loginRes.data.user.id);
        console.log('BMR:', loginRes.data.user.bmr);

        console.log('--- ALL TESTS PASSED ---');

    } catch (err) {
        if (err.response) {
            console.error('API Error:', err.response.status, err.response.data);
        } else {
            console.error('Error:', err);
        }
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runUtility();
