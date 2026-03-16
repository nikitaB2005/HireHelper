const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ================= REGISTER ROUTE =================
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔢 Generate 6-digit OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();

// ⏳ Set expiry (10 minutes from now)
const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

await pool.query(
  `INSERT INTO users 
   (email, password, first_name, last_name, otp, otp_expiry, is_verified) 
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [email, hashedPassword, first_name, last_name, otp, otp_expiry, false]
);

   return res.status(201).json({
  message: "User registered. OTP generated.",
  otp: otp
});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN ROUTE =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const dbUser = user.rows[0];
// 🚫 Block unverified users
if (!dbUser.is_verified) {
  return res.status(403).json({ message: "Please verify your email first" });
}
    // 🔐 Compare hashed password
    const isMatch = await bcrypt.compare(password, dbUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🔐 Create JWT
    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
// ================= VERIFY OTP ROUTE =================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Check OTP match
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check expiry
    if (new Date() > user.otp_expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Update user as verified
    await pool.query(
      `UPDATE users 
       SET is_verified = true, 
           otp = NULL, 
           otp_expiry = NULL 
       WHERE email = $1`,
      [email]
    );

    return res.status(200).json({ message: "Email verified successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================= PROTECTED ROUTE =================
// ================= PROTECTED ROUTE =================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [req.user.id]
    );

    res.status(200).json(user.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;