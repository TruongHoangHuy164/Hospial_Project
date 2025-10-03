const mongoose = require('mongoose');

const DichVuSchema = new mongoose.Schema({
  chuyenKhoaId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChuyenKhoa', required: true },
  ten: { type: String, required: true, trim: true },
  moTa: { type: String, default: '' },
  active: { type: Boolean, default: true },
  gia: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

// Unique service name within a specialty
DichVuSchema.index({ chuyenKhoaId: 1, ten: 1 }, { unique: true });

module.exports = mongoose.model('DichVu', DichVuSchema);
