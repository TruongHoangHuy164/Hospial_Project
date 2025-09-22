const mongoose = require('mongoose');

const ChuyenKhoaSchema = new mongoose.Schema(
  {
    ten: { type: String, required: true, trim: true, unique: true },
    moTa: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChuyenKhoa', ChuyenKhoaSchema);
