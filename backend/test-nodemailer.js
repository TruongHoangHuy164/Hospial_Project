// Test script để kiểm tra nodemailer
const nodemailer = require('nodemailer');

console.log('Testing nodemailer...');
console.log('nodemailer version:', require('nodemailer/package.json').version);
console.log('Available methods:', Object.getOwnPropertyNames(nodemailer));

// Test createTransport
try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test@gmail.com',
      pass: 'test'
    }
  });
  console.log('✅ createTransport works!');
  console.log('Transporter created:', typeof transporter);
} catch (error) {
  console.error('❌ createTransport failed:', error.message);
}