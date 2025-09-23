const mongoose = require('mongoose');

// Lịch làm việc của bác sĩ theo ngày/ca
// ca: sáng/chiều/tối; loaiCa: làm việc/trực/nghỉ
const DoctorScheduleSchema = new mongoose.Schema(
  {
    bacSiId: { type: mongoose.Schema.Types.ObjectId, ref: 'BacSi', required: true, index: true },
    ngay: { type: Date, required: true, index: true }, // chỉ phần ngày (00:00)
    ca: { type: String, enum: ['sang', 'chieu', 'toi'], required: true },
    loaiCa: { type: String, enum: ['lam_viec', 'truc', 'nghi'], default: 'lam_viec', index: true },
    phongKhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhongKham' },
    lyDo: { type: String }, // lý do nghỉ/trực nếu có
    note: { type: String },
  },
  { timestamps: true }
);

DoctorScheduleSchema.index({ bacSiId: 1, ngay: 1, ca: 1 }, { unique: true });

module.exports = mongoose.model('DoctorSchedule', DoctorScheduleSchema);
