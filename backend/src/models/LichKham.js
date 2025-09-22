const mongoose = require('mongoose');

const LichKhamSchema = new mongoose.Schema(
  {
    benhNhanId: { type: mongoose.Schema.Types.ObjectId, ref: 'BenhNhan', required: true, index: true },
    bacSiId: { type: mongoose.Schema.Types.ObjectId, ref: 'BacSi', required: true, index: true },
    chuyenKhoaId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChuyenKhoa', required: true, index: true },
    ngayKham: { type: Date, required: true, index: true },
    khungGio: { type: String, required: true },
    trangThai: { type: String, enum: ['cho_thanh_toan', 'da_thanh_toan', 'da_kham'], default: 'cho_thanh_toan', index: true },
  },
  { timestamps: true }
);

LichKhamSchema.index({ bacSiId: 1, ngayKham: 1, khungGio: 1 }, { unique: true });

module.exports = mongoose.model('LichKham', LichKhamSchema);
