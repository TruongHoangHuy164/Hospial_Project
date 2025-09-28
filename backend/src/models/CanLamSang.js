const mongoose = require('mongoose');

const CanLamSangSchema = new mongoose.Schema(
  {
    hoSoKhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HoSoKham', required: true, index: true },
    loaiChiDinh: { type: String, enum: ['xet_nghiem', 'sieu_am', 'x_quang', 'ct', 'mri', 'dien_tim', 'noi_soi'], required: true, index: true },
    trangThai: { type: String, enum: ['cho_thuc_hien', 'dang_thuc_hien', 'da_xong'], default: 'cho_thuc_hien', index: true },
    ketQua: { type: String },
    ngayThucHien: { type: Date },
    nhanVienId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CanLamSang', CanLamSangSchema);
