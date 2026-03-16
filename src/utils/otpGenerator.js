// hirehelper-backend/src/utils/otpGenerator.js
const pool = require('../db');

const generateAndStoreOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await pool.query(
    `UPDATE users SET otp = $1, otp_expiry = $2 WHERE email = $3`,
    [otp, otpExpiry, email]
  );

  console.log(`OTP for ${email}: ${otp} (expires in 10 min)`); // For testing
  return otp;
};

module.exports = { generateAndStoreOtp };