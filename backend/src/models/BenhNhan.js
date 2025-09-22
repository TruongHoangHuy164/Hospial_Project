const mongoose = require('mongoose');

const BenhNhanSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true, trim: true },
    ngaySinh: { type: Date },
    gioiTinh: { type: String, enum: ['nam', 'nu', 'khac'], default: 'khac' },
    diaChi: { type: String },
    soDienThoai: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BenhNhan', BenhNhanSchema);
