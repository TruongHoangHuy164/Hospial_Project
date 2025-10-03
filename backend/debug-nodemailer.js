// Simple test to check nodemailer
console.log('=== Testing nodemailer ===');

try {
  const nodemailer = require('nodemailer');
  console.log('✅ nodemailer imported successfully');
  console.log('Available methods:', Object.keys(nodemailer));
  
  // Test createTransport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test@gmail.com',
      pass: 'test'
    }
  });
  
  console.log('✅ createTransport works!');
  console.log('Transporter type:', typeof transporter);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}