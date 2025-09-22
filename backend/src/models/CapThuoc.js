const mongoose = require('mongoose');

const CapThuocSchema = new mongoose.Schema(
  {
    donThuocId: { type: mongoose.Schema.Types.ObjectId, ref: 'DonThuoc', required: true, index: true },
    thuocId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thuoc', required: true, index: true },
    soLuong: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CapThuoc', CapThuocSchema);
