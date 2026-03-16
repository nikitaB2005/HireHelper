const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL connection
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { id } = req.user; // set by JWT middleware
        const { rows } = await pool.query(
            'SELECT id, first_name, email FROM users WHERE id = $1',
            [id]
        );

        if (!rows[0]) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(rows[0]); // send user info
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;