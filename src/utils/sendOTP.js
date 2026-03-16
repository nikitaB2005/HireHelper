const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "YOUR_EMAIL@gmail.com",        // ✅ replace with your email
      pass: "YOUR_APP_PASSWORD"            // ✅ replace with app password
    }
  });

  let info = await transporter.sendMail({
    from: '"HireHelper" <YOUR_EMAIL@gmail.com>',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`
  });

  console.log("OTP sent:", info.messageId);
};

module.exports = sendOTP;