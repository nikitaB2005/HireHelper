const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🔍 Test connection
pool.connect()
  .then(client => {
    console.log("Database Connected");
    client.release(); // release back to pool
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });

module.exports = pool;