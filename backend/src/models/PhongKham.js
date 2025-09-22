const mongoose = require('mongoose');

const PhongKhamSchema = new mongoose.Schema(
  {
    tenPhong: { type: String, required: true, trim: true },
    chuyenKhoa: { type: String, required: true, trim: true, index: true },
    chuyenKhoaId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChuyenKhoa', index: true },
  },
  { timestamps: true }
);

PhongKhamSchema.index({ tenPhong: 'text', chuyenKhoa: 'text' });

module.exports = mongoose.model('PhongKham', PhongKhamSchema);
