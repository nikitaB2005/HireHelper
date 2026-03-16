// src/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Temporary register controller
const registerController = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, is_verified)
             VALUES ($1, $2, $3, $4, true)`,
            [first_name || 'Test', last_name || 'User', email, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login controller
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        const user = rows[0];

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (!user.is_verified) return res.status(403).json({ message: 'Please verify your account' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerController, loginController };