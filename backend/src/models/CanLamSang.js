const mongoose = require('mongoose');

const CanLamSangSchema = new mongoose.Schema(
  {
    hoSoKhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HoSoKham', required: true, index: true },
    loaiChiDinh: { type: String, enum: ['xet_nghiem', 'sieu_am', 'x_quang', 'ct', 'mri', 'dien_tim', 'noi_soi'], required: true, index: true },
    ketQua: { type: String },
    ngayThucHien: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CanLamSang', CanLamSangSchema);
