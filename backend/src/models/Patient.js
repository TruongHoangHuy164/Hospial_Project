const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
