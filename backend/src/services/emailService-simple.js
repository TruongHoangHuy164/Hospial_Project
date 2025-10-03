// Simplified email service for testing
const nodemailer = require('nodemailer');

console.log('Loading emailService...');
console.log('Nodemailer available:', !!nodemailer);
console.log('createTransport available:', typeof nodemailer.createTransport);

// Simplified createTransporter function
const createTransporter = () => {
  console.log('Creating transporter...');
  
  if (typeof nodemailer.createTransport !== 'function') {
    throw new Error('nodemailer.createTransport is not a function');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Simplified sendOtpEmail function
const sendOtpEmail = async (email, otp, type = 'change_password') => {
  try {
    console.log('Starting sendOtpEmail...');
    const transporter = createTransporter();
    console.log('Transporter created successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP xác thực đổi mật khẩu',
      html: `
        <h2>Mã OTP của bạn</h2>
        <p>Mã OTP: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
        <p>Mã này có hiệu lực trong 3 phút.</p>
      `
    };
    
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  testEmailConnection
};