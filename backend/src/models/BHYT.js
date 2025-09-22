const mongoose = require('mongoose');

const BHYTSchema = new mongoose.Schema(
  {
    benhNhanId: { type: mongoose.Schema.Types.ObjectId, ref: 'BenhNhan', required: true, index: true },
    maTheBHYT: { type: String, required: true, trim: true, unique: true },
    ngayBatDau: { type: Date, required: true },
    ngayHetHan: { type: Date, required: true },
    giayChuyenVien: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BHYT', BHYTSchema);
