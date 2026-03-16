// hirehelper-backend/src/utils/otpUtils.js
const compareOtp = (storedOtp, receivedOtp, expiryTime) => {
  const currentTime = new Date();

  // convert to string and trim
  const stored = storedOtp ? String(storedOtp).trim() : '';
  const received = receivedOtp ? String(receivedOtp).trim() : '';

  if (stored !== received) {
    console.log(`Mismatch! Stored: ${stored}, Received: ${received}`);
    return { valid: false, message: 'Invalid OTP' };
  }

  // Ensure expiryTime is a Date object
  const expiry = expiryTime instanceof Date ? expiryTime : new Date(expiryTime);
  if (expiry < currentTime) {
    return { valid: false, message: 'OTP expired' };
  }

  return { valid: true, message: 'OTP verified' };
};

module.exports = { compareOtp };