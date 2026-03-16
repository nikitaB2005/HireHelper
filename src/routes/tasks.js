const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const verifyToken = require('../middleware/verifyToken');


// ADD TASK API
router.post('/', verifyToken, async (req, res) => {
  try {

    const { title, description, budget, category } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const userId = req.user.id;

    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, budget, category, created_by)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [title, description, budget, category, userId]
    );

    res.json(newTask.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// MY TASKS
router.get('/my', verifyToken, async (req, res) => {
  try {

    const userId = req.user.id;

    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE created_by = $1',
      [userId]
    );

    res.json(tasks.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// DASHBOARD STATS (MOVE THIS ABOVE '/')
router.get('/stats', verifyToken, async (req, res) => {
  try {

    const userId = req.user.id;

    const total = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE created_by = $1',
      [userId]
    );

    const active = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE created_by = $1 AND status = 'active'",
      [userId]
    );

    const completed = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE created_by = $1 AND status = 'completed'",
      [userId]
    );

    res.json({
      total: total.rows[0].count,
      active: active.rows[0].count,
      completed: completed.rows[0].count
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// FEED
router.get('/', verifyToken, async (req, res) => {
  try {

    const userId = req.user.id;

    const tasks = await pool.query(
  `SELECT * FROM tasks ORDER BY created_at DESC`
);

    res.json(tasks.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;