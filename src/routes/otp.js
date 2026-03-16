const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const pool = require('../db'); // your database connection

let otpStore = {}; // simple in-memory store for OTPs

router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        // 1️⃣ Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let newUser = false;

        if (userResult.rows.length === 0) {
            // 2️⃣ User does not exist → create new user
            await pool.query('INSERT INTO users (email) VALUES ($1)', [email]);
            newUser = true;
            console.log('New user created:', email);
        } else {
            console.log('Existing user:', email);
        }

        // 3️⃣ Generate OTP
        const otp = crypto.randomInt(100000, 999999);
        otpStore[email] = otp;

        // 4️⃣ Send OTP via nodemailer
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'unnimole999@gmail.com',
                pass: 'anhwertdovcuzscp' // your app password
            }
        });

        await transporter.sendMail({
            from: 'unnimole999@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is: ${otp}`
        });

        // 5️⃣ Send response to frontend
        res.json({ message: 'OTP sent successfully', newUser });

    } catch (error) {
        console.log('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP', error });
    }
});

router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otpStore[email] && otpStore[email] == otp) {
        delete otpStore[email];
        res.json({ message: 'OTP verified' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});

module.exports = router;