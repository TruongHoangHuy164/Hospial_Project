const mongoose = require('mongoose');

const BenhNhanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    hoTen: { type: String, required: true, trim: true },
    ngaySinh: { type: Date },
    gioiTinh: { type: String, enum: ['nam', 'nu', 'khac'], default: 'khac' },
    diaChi: { type: String },
    soDienThoai: { type: String, index: true },
    maBHYT: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BenhNhan', BenhNhanSchema);
