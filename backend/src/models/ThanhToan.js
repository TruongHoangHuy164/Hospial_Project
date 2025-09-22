const mongoose = require('mongoose');

const ThanhToanSchema = new mongoose.Schema(
  {
    hoSoKhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HoSoKham', required: true, index: true },
    soTien: { type: Number, required: true, min: 0 },
    hinhThuc: { type: String, enum: ['BHYT', 'tien_mat'], required: true, index: true },
    ngayThanhToan: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ThanhToan', ThanhToanSchema);
