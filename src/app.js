require('dotenv').config({ path: '../.env' });
const taskRoutes = require('./routes/tasks');
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');

const app = express();

// ✅ Enable CORS
app.use(cors());

// ✅ Parse JSON body
app.use(express.json());

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', tasksRouter);
// Import the OTP route
const otpRoutes = require('./routes/otp');  // <- make sure the path matches your file

// Use the OTP routes under /api
app.use('/api', otpRoutes);
// ✅ Test route (optional but useful)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});