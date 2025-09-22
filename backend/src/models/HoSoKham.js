const mongoose = require('mongoose');

const HoSoKhamSchema = new mongoose.Schema(
  {
    benhNhanId: { type: mongoose.Schema.Types.ObjectId, ref: 'BenhNhan', required: true, index: true },
    bacSiId: { type: mongoose.Schema.Types.ObjectId, ref: 'BacSi', required: true, index: true },
    ngayKham: { type: Date, default: Date.now },
    chanDoan: { type: String },
    huongDieuTri: { type: String, enum: ['ngoai_tru', 'noi_tru', 'chuyen_vien', 'ke_don'], index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HoSoKham', HoSoKhamSchema);
