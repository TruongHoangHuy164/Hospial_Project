const express = require('express');
const mongoose = require('mongoose');
const BenhNhan = require('../models/BenhNhan');
const ChuyenKhoa = require('../models/ChuyenKhoa');
const BacSi = require('../models/BacSi');
const LichKham = require('../models/LichKham');
const SoThuTu = require('../models/SoThuTu');
const auth = require('../middlewares/auth');

const router = express.Router();

// Helpers
function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function endOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()+1); }

// POST /api/booking/patients - create or update a patient profile for current user
router.post('/patients', auth, async (req, res, next) => {
  try{
    const userId = req.user?.id || null;
    const { id, hoTen, ngaySinh, gioiTinh, soDienThoai, diaChi, maBHYT } = req.body || {};
    const data = { userId, hoTen, ngaySinh, gioiTinh, soDienThoai, diaChi, maBHYT };
    let bn;
    if(id){
      bn = await BenhNhan.findOneAndUpdate({ _id: id, ...(userId? { userId } : {}) }, data, { new: true });
    } else {
      bn = await BenhNhan.create(data);
    }
    return res.status(id?200:201).json(bn);
  }catch(err){ return next(err); }
});

// GET /api/booking/patients - list patients of current user (or search by phone for guests)
router.get('/patients', auth, async (req, res, next) => {
  try{
    const userId = req.user?.id || null;
    const { phone } = req.query;
    const filter = userId ? { userId } : (phone? { soDienThoai: phone } : {});
    const items = await BenhNhan.find(filter).sort({ updatedAt: -1 }).limit(20);
    return res.json(items);
  }catch(err){ return next(err); }
});

// GET /api/booking/specialties - list specialties
router.get('/specialties', async (req, res, next) => {
  try{
    const items = await ChuyenKhoa.find().sort({ ten: 1 });
    res.json(items);
  }catch(err){ return next(err); }
});

// GET /api/booking/availability - get doctors & free slots for a specialty and date
// query: chuyenKhoaId, date=YYYY-MM-DD
router.get('/availability', async (req, res, next) => {
  try{
    const { chuyenKhoaId, date } = req.query;
    if(!chuyenKhoaId || !date) return res.status(400).json({ message: 'Thiếu chuyenKhoaId hoặc date' });
    const d = new Date(date);
    if(isNaN(d.getTime())) return res.status(400).json({ message: 'date không hợp lệ' });

    // Find doctors in specialty
    const doctors = await BacSi.find({ chuyenKhoa: { $exists: true }, phongKhamId: { $exists: true } , /* placeholder */}).where({}).find({}).where('chuyenKhoa').regex(/.*/)
      .find();
    // Note: The project stores specialty name in BacSi.chuyenKhoa (string), while PhongKham references a ChuyenKhoaId.
    // We'll include doctors whose chuyenKhoa matches the specialty name for now.
    const spec = await ChuyenKhoa.findById(chuyenKhoaId);
    if(!spec) return res.status(404).json({ message: 'Chuyên khoa không tồn tại' });
    const list = await BacSi.find({ chuyenKhoa: spec.ten }).select('hoTen chuyenKhoa phongKhamId');

    // Assume fixed time slots; in real app, load from doctor schedule
    const slots = ['08:00','08:30','09:00','09:30','10:00','10:30','14:00','14:30','15:00','15:30'];
    const dayStart = startOfDay(d), dayEnd = endOfDay(d);
    const busy = await LichKham.find({ bacSiId: { $in: list.map(x=>x._id) }, ngayKham: { $gte: dayStart, $lt: dayEnd } })
      .select('bacSiId khungGio');
    const busyMap = busy.reduce((m, x)=>{
      const k = String(x.bacSiId);
      m[k] = m[k] || new Set();
      m[k].add(x.khungGio);
      return m;
    }, {});
    const result = list.map(d => {
      const taken = busyMap[String(d._id)] || new Set();
      const free = slots.filter(s => !taken.has(s));
      return { bacSiId: d._id, hoTen: d.hoTen, chuyenKhoa: d.chuyenKhoa, khungGioTrong: free };
    });
    res.json({ date, chuyenKhoaId, doctors: result, slots });
  }catch(err){ return next(err); }
});

// POST /api/booking/appointments - create appointment
router.post('/appointments', async (req, res, next) => {
  try{
    const { benhNhanId, bacSiId, chuyenKhoaId, date, khungGio } = req.body || {};
    if(!benhNhanId || !bacSiId || !chuyenKhoaId || !date || !khungGio) return res.status(400).json({ message: 'Thiếu dữ liệu' });
    const d = new Date(date);
    if(isNaN(d.getTime())) return res.status(400).json({ message: 'date không hợp lệ' });
    const dayStart = startOfDay(d);
    // Save as exact date with time start-of-day; store khungGio separately
    const lk = await LichKham.create({ benhNhanId, bacSiId, chuyenKhoaId, ngayKham: dayStart, khungGio, trangThai: 'cho_thanh_toan' });
    res.status(201).json(lk);
  }catch(err){
    if(err && err.code === 11000){
      return res.status(409).json({ message: 'Khung giờ đã được đặt' });
    }
    return next(err);
  }
});

// POST /api/booking/appointments/:id/pay - mark as paid and issue queue number
router.post('/appointments/:id/pay', async (req, res, next) => {
  try{
    const { id } = req.params;
    const appt = await LichKham.findById(id);
    if(!appt) return res.status(404).json({ message: 'Không tìm thấy lịch khám' });
    appt.trangThai = 'da_thanh_toan';
    await appt.save();

    // Generate queue number for that date and doctor
    const dayStart = startOfDay(appt.ngayKham);
    const dayEnd = endOfDay(appt.ngayKham);
    const count = await SoThuTu.countDocuments({ lichKhamId: { $exists: true }, createdAt: { $gte: dayStart, $lt: dayEnd }, benhNhanId: appt.benhNhanId });
    const so = count + 1;
    const stt = await SoThuTu.create({ lichKhamId: appt._id, benhNhanId: appt.benhNhanId, soThuTu: so, trangThai: 'dang_cho' });
    res.json({ lichKham: appt, soThuTu: stt });
  }catch(err){ return next(err); }
});

module.exports = router;
