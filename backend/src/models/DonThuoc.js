const mongoose = require('mongoose');

const DonThuocSchema = new mongoose.Schema(
  {
    hoSoKhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HoSoKham', required: true, index: true },
    ngayKeDon: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonThuoc', DonThuocSchema);
