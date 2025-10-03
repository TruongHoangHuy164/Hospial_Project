const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['change_password', 'forgot_password', 'verify_email'],
    default: 'change_password'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB will automatically delete expired documents
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of used OTPs
OtpSchema.index({ isUsed: 1, expiresAt: 1 });

module.exports = mongoose.model('Otp', OtpSchema);