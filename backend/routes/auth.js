const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// Nodemailer Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// --- Signup Handler ---
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`[Signup] Executing INSERT for user: ${email.trim().toLowerCase()}`);
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email.trim().toLowerCase(), hashedPassword]
        );
        console.log(`[Signup] User inserted successfully during signup: ${newUser.rows[0].email}`);

        const token = jwt.sign(
            { id: newUser.rows[0].id, email: newUser.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ user: newUser.rows[0], token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Signup failed.' });
    }
});

// --- Login Handler ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[Login] email input: ${email}`);
        const normalizedEmail = email.trim().toLowerCase();

        const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        console.log(`[Login] DB result row count: ${result.rows.length}`);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'User not found.' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log(`[Login] password match result: ${validPassword}`);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_onboarded: user.is_onboarded,
                temp_password_active: user.temp_password_active
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// --- Forgot Password (Real Implementation) ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Generate temporary password
        const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 chars
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await db.query(
            'UPDATE users SET password_hash = $1, temp_password_active = true WHERE email = $2',
            [hashedPassword, normalizedEmail]
        );

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: normalizedEmail,
            subject: 'VitalIQ - Temporary Password',
            text: `Your temporary password is: ${tempPassword}\n\nPlease login and change your password immediately in your profile settings.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Temp password sent to ${normalizedEmail}`);

        res.json({ message: 'Temporary password sent to your email.' });
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ error: 'Failed to send reset email.' });
    }
});

// --- Change Password (Authenticated) ---
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        const validOld = await bcrypt.compare(oldPassword, user.password_hash);
        if (!validOld) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE users SET password_hash = $1, temp_password_active = false WHERE id = $2',
            [hashedNew, userId]
        );

        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to change password.' });
    }
});

module.exports = router;
