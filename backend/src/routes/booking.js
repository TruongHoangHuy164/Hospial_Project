const express = require('express');
const mongoose = require('mongoose');
const BenhNhan = require('../models/BenhNhan');
const ChuyenKhoa = require('../models/ChuyenKhoa');
const BacSi = require('../models/BacSi');
const LichKham = require('../models/LichKham');
const SoThuTu = require('../models/SoThuTu');
const HoSoKham = require('../models/HoSoKham');
const CanLamSang = require('../models/CanLamSang');
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

// GET /api/booking/my-appointments?page=1&limit=10
// Return appointments for current user (based on BenhNhan.userId)
router.get('/my-appointments', auth, async (req, res, next) => {
  try{
    const page = Math.max(parseInt(req.query.page||'1',10),1);
    const limit = Math.min(Math.max(parseInt(req.query.limit||'10',10),1),50);
    const skip = (page-1)*limit;
    // Find patients owned by current user
    const myPatients = await BenhNhan.find({ userId: req.user.id }).select('_id').lean();
    const ids = myPatients.map(p=>p._id);
    if(ids.length===0) return res.json({ items: [], total: 0, page, limit, totalPages: 0 });
    const [items, total] = await Promise.all([
      LichKham.find({ benhNhanId: { $in: ids } })
        .sort({ ngayKham: -1, createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('bacSiId','hoTen chuyenKhoa')
        .populate('chuyenKhoaId','ten'),
      LichKham.countDocuments({ benhNhanId: { $in: ids } })
    ]);
    // attach queue numbers
    const stts = await SoThuTu.find({ lichKhamId: { $in: items.map(i=>i._id) } }).select('lichKhamId soThuTu trangThai').lean();
    const sttMap = stts.reduce((m,s)=>{ m[String(s.lichKhamId)] = s; return m; },{});
    const result = items.map(ap => ({
      _id: ap._id,
      ngayKham: ap.ngayKham,
      khungGio: ap.khungGio,
      trangThai: ap.trangThai,
      bacSi: ap.bacSiId ? { id: ap.bacSiId._id, hoTen: ap.bacSiId.hoTen, chuyenKhoa: ap.bacSiId.chuyenKhoa } : null,
      chuyenKhoa: ap.chuyenKhoaId ? { id: ap.chuyenKhoaId._id, ten: ap.chuyenKhoaId.ten } : null,
      soThuTu: sttMap[String(ap._id)]?.soThuTu || null,
      sttTrangThai: sttMap[String(ap._id)]?.trangThai || null,
    }));
    res.json({ items: result, total, page, limit, totalPages: Math.ceil(total/limit) });
  }catch(err){ return next(err); }
});

// GET /api/booking/my-results?page=1&limit=10
router.get('/my-results', auth, async (req, res, next) => {
  try{
    const page = Math.max(parseInt(req.query.page||'1',10),1);
    const limit = Math.min(Math.max(parseInt(req.query.limit||'10',10),1),50);
    const skip = (page-1)*limit;
    // patients of current user
    const myPatients = await BenhNhan.find({ userId: req.user.id }).select('_id').lean();
    const pids = myPatients.map(p=>p._id);
    if(pids.length===0) return res.json({ items: [], total: 0, page, limit, totalPages: 0 });
    const hoSos = await HoSoKham.find({ benhNhanId: { $in: pids } }).select('_id').lean();
    const hsIds = hoSos.map(h=>h._id);
    if(hsIds.length===0) return res.json({ items: [], total: 0, page, limit, totalPages: 0 });
    const [labs, total] = await Promise.all([
      CanLamSang.find({ hoSoKhamId: { $in: hsIds } })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate({ path: 'hoSoKhamId', select: 'benhNhanId bacSiId ngayKham', populate: { path: 'bacSiId', select: 'hoTen chuyenKhoa' } }),
      CanLamSang.countDocuments({ hoSoKhamId: { $in: hsIds } })
    ]);
    const items = labs.map(l => ({
      _id: l._id,
      loaiChiDinh: l.loaiChiDinh,
      trangThai: l.trangThai,
      ketQua: l.ketQua,
      ngayThucHien: l.ngayThucHien,
      createdAt: l.createdAt,
      bacSi: l.hoSoKhamId?.bacSiId ? { id: l.hoSoKhamId.bacSiId._id, hoTen: l.hoSoKhamId.bacSiId.hoTen, chuyenKhoa: l.hoSoKhamId.bacSiId.chuyenKhoa } : null,
      ngayKham: l.hoSoKhamId?.ngayKham || null,
    }));
    res.json({ items, total, page, limit, totalPages: Math.ceil(total/limit) });
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

// GET /api/booking/appointments - list appointments (optional filters)
// query: date=YYYY-MM-DD, benhNhanId, bacSiId
router.get('/appointments', async (req, res, next) => {
  try{
    const { date, benhNhanId, bacSiId } = req.query;
    const filter = {};
    if(date){
      const d = new Date(date); if(isNaN(d)) return res.status(400).json({ message: 'date không hợp lệ' });
      filter.ngayKham = { $gte: startOfDay(d), $lt: endOfDay(d) };
    }
    if(benhNhanId) filter.benhNhanId = new mongoose.Types.ObjectId(benhNhanId);
    if(bacSiId) filter.bacSiId = new mongoose.Types.ObjectId(bacSiId);
    const items = await LichKham.find(filter).sort({ ngayKham: -1, khungGio: 1 });
    res.json(items);
  }catch(err){ return next(err); }
});

// PUT /api/booking/appointments/:id - reschedule
router.put('/appointments/:id', async (req, res, next) => {
  try{
    const { date, khungGio, bacSiId } = req.body || {};
    const update = {};
    if(date){ const d = new Date(date); if(isNaN(d)) return res.status(400).json({ message: 'date không hợp lệ' }); update.ngayKham = startOfDay(d); }
    if(khungGio) update.khungGio = khungGio;
    if(bacSiId) update.bacSiId = bacSiId;
    if(Object.keys(update).length===0) return res.status(400).json({ message: 'Không có gì để cập nhật' });
    const doc = await LichKham.findByIdAndUpdate(req.params.id, update, { new: true });
    if(!doc) return res.status(404).json({ message: 'Không tìm thấy lịch' });
    res.json(doc);
  }catch(err){
    if(err && err.code===11000){ return res.status(409).json({ message: 'Khung giờ đã được đặt' }); }
    return next(err);
  }
});

// GET /api/booking/queues - list queue numbers for a date (optional doctor)
router.get('/queues', async (req, res, next) => {
  try{
    const { date, bacSiId } = req.query;
    const d = date ? new Date(date) : new Date();
    if(isNaN(d)) return res.status(400).json({ message: 'date không hợp lệ' });
    const dayStart = startOfDay(d), dayEnd = endOfDay(d);
    // find appts in date range
    const appts = await LichKham.find({ ngayKham: { $gte: dayStart, $lt: dayEnd }, ...(bacSiId? { bacSiId } : {}) }).select('_id benhNhanId bacSiId khungGio').lean();
    const stts = await SoThuTu.find({ lichKhamId: { $in: appts.map(a=>a._id) } }).select('lichKhamId soThuTu trangThai').lean();
    const bnIds = appts.map(a=>a.benhNhanId);
    const bns = await BenhNhan.find({ _id: { $in: bnIds } }).select('hoTen soDienThoai').lean();
    const bnMap = bns.reduce((m,b)=>{ m[String(b._id)] = b; return m; },{});
    const sttMap = stts.reduce((m,s)=>{ m[String(s.lichKhamId)] = s; return m; },{});
    const items = appts.map(a => ({
      lichKhamId: a._id,
      benhNhan: bnMap[String(a.benhNhanId)] || null,
      khungGio: a.khungGio,
      soThuTu: sttMap[String(a._id)]?.soThuTu || null,
      trangThai: sttMap[String(a._id)]?.trangThai || 'dang_cho',
    })).sort((x,y)=>{
      const sx = x.soThuTu ?? 1e9; const sy = y.soThuTu ?? 1e9;
      if(sx!==sy) return sx-sy; return (x.khungGio||'').localeCompare(y.khungGio||'');
    });
    res.json(items);
  }catch(err){ return next(err); }
});

module.exports = router;
