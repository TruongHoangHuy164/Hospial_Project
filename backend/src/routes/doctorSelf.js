const express = require('express');
const BacSi = require('../models/BacSi');
const BenhNhan = require('../models/BenhNhan');
const HoSoKham = require('../models/HoSoKham');
const DonThuoc = require('../models/DonThuoc');
const CapThuoc = require('../models/CapThuoc');
const Thuoc = require('../models/Thuoc');
const DoctorSchedule = require('../models/DoctorSchedule');
const LichKham = require('../models/LichKham');
const SoThuTu = require('../models/SoThuTu');
const CanLamSang = require('../models/CanLamSang');

const router = express.Router();

// Helper middleware: load doctor by req.user.id and attach to req.doctor
async function loadDoctor(req, res, next){
  try{
    const userId = req.user?.id;
    if(!userId) return res.status(401).json({ message: 'Unauthorized' });
    const doc = await BacSi.findOne({ userId });
    if(!doc) return res.status(404).json({ message: 'Chưa liên kết hồ sơ bác sĩ với tài khoản này' });
    req.doctor = doc;
    return next();
  }catch(err){ return next(err); }
}

// GET /api/doctor/me - lấy hồ sơ bác sĩ gắn với tài khoản đăng nhập
router.get('/me', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const bs = await BacSi.findOne({ userId })
      .populate('phongKhamId', 'tenPhong chuyenKhoa')
      .populate('userId', 'email role');
    if (!bs) return res.status(404).json({ message: 'Chưa liên kết hồ sơ bác sĩ với tài khoản này' });
    return res.json(bs);
  } catch (err) { return next(err); }
});

// PUT /api/doctor/me - cập nhật thông tin cá nhân (giới hạn các trường cho phép)
router.put('/me', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const allow = ['hoTen','email','soDienThoai','diaChi','anhDaiDien','moTa','ngaySinh','gioiTinh'];
    const body = req.body || {};
    const update = {};
    for (const k of allow) {
      if (typeof body[k] !== 'undefined') update[k] = body[k];
    }
    const bs = await BacSi.findOneAndUpdate({ userId }, update, { new: true })
      .populate('phongKhamId', 'tenPhong chuyenKhoa')
      .populate('userId', 'email role');
    if (!bs) return res.status(404).json({ message: 'Chưa liên kết hồ sơ bác sĩ với tài khoản này' });
    return res.json(bs);
  } catch (err) { return next(err); }
});

// GET /api/doctor/patients - tìm kiếm bệnh nhân theo tên/sđt
router.get('/patients', loadDoctor, async (req, res, next) => {
  try{
    const { q, phone } = req.query;
    const filter = {};
    if (q) filter.hoTen = { $regex: q, $options: 'i' };
    if (phone) filter.soDienThoai = { $regex: phone, $options: 'i' };
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const [items, total] = await Promise.all([
      BenhNhan.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      BenhNhan.countDocuments(filter)
    ]);
    res.json({ items, total, page, limit });
  }catch(err){ return next(err); }
});

// POST /api/doctor/patients - tạo bệnh nhân nhanh
router.post('/patients', loadDoctor, async (req, res, next) => {
  try{
    const { hoTen, soDienThoai, ngaySinh, gioiTinh, diaChi } = req.body || {};
    if(!hoTen) return res.status(400).json({ message: 'Thiếu họ tên' });
    const bn = await BenhNhan.create({ hoTen, soDienThoai, ngaySinh, gioiTinh, diaChi });
    res.status(201).json(bn);
  }catch(err){ return next(err); }
});

// GET /api/doctor/cases - danh sách hồ sơ khám của bác sĩ hiện tại (tùy chọn lọc theo ngày)
router.get('/cases', loadDoctor, async (req, res, next) => {
  try{
    const bacSiId = req.doctor._id;
    const filter = { bacSiId };
    const { date } = req.query;
    if (date) {
      // date = 'today' hoặc 'YYYY-MM-DD'
      let start;
      if (date === 'today') {
        start = new Date();
      } else {
        start = new Date(date);
      }
      if (isNaN(start.getTime())) return res.status(400).json({ message: 'Ngày không hợp lệ' });
      const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const dayEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate()+1);
      filter.createdAt = { $gte: dayStart, $lt: dayEnd };
    }
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const [items, total] = await Promise.all([
      HoSoKham.find(filter)
        .populate('benhNhanId', 'hoTen soDienThoai ngaySinh gioiTinh')
        .sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      HoSoKham.countDocuments(filter)
    ]);
    res.json({ items, total, page, limit });
  }catch(err){ return next(err); }
});

// POST /api/doctor/cases - tạo hồ sơ khám
router.post('/cases', loadDoctor, async (req, res, next) => {
  try{
    const bacSiId = req.doctor._id;
    const { benhNhanId, chanDoan, huongDieuTri } = req.body || {};
    if(!benhNhanId) return res.status(400).json({ message: 'Thiếu benhNhanId' });
    if (huongDieuTri && !['ngoai_tru','noi_tru','chuyen_vien','ke_don'].includes(huongDieuTri)) {
      return res.status(400).json({ message: 'huongDieuTri không hợp lệ' });
    }
    // ensure patient exists
    const bn = await BenhNhan.findById(benhNhanId);
    if(!bn) return res.status(404).json({ message: 'Bệnh nhân không tồn tại' });
    const hs = await HoSoKham.create({ benhNhanId, bacSiId, chanDoan, huongDieuTri });
    const populated = await hs.populate('benhNhanId', 'hoTen soDienThoai ngaySinh gioiTinh');
    res.status(201).json(populated);
  }catch(err){ return next(err); }
});

// GET /api/doctor/medicines - tìm thuốc
router.get('/medicines', loadDoctor, async (req, res, next) => {
  try{
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    let items;
    if (q) {
      // ưu tiên text search nếu có index
      items = await Thuoc.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit);
      if (!items.length) {
        items = await Thuoc.find({ tenThuoc: { $regex: q, $options: 'i' } }).limit(limit);
      }
    } else {
      items = await Thuoc.find().sort({ updatedAt: -1 }).limit(limit);
    }
    res.json(items);
  }catch(err){ return next(err); }
});

// POST /api/doctor/cases/:id/prescriptions - kê đơn cho hồ sơ khám
router.post('/cases/:id/prescriptions', loadDoctor, async (req, res, next) => {
  try{
    const { id } = req.params;
    const hs = await HoSoKham.findOne({ _id: id, bacSiId: req.doctor._id });
    if(!hs) return res.status(404).json({ message: 'Không tìm thấy hồ sơ khám hoặc không có quyền' });
    const { items } = req.body || {};
    if(!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Danh sách thuốc trống' });
    const don = await DonThuoc.create({ hoSoKhamId: hs._id });
    const caps = items
      .filter(it => it && it.thuocId && Number(it.soLuong) > 0)
      .map(it => ({ donThuocId: don._id, thuocId: it.thuocId, soLuong: Number(it.soLuong) }));
    if (!caps.length) return res.status(400).json({ message: 'Danh sách thuốc không hợp lệ' });
    await CapThuoc.insertMany(caps);
    res.status(201).json({ donThuocId: don._id, items: caps.length });
  }catch(err){ return next(err); }
});

// ===== Lịch làm việc của bác sĩ =====
// GET /api/doctor/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/schedule', loadDoctor, async (req, res, next) => {
  try{
    const { from, to } = req.query;
    const filter = { bacSiId: req.doctor._id };
    if(from || to){
      const f = from ? new Date(from) : null;
      const t = to ? new Date(to) : null;
      if((from && isNaN(f)) || (to && isNaN(t))) return res.status(400).json({ message: 'Ngày không hợp lệ' });
      filter.ngay = {};
      if(f) filter.ngay.$gte = new Date(f.getFullYear(), f.getMonth(), f.getDate());
      if(t) filter.ngay.$lte = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    }
    const items = await DoctorSchedule.find(filter).sort({ ngay: 1, ca: 1 });
    res.json(items);
  }catch(err){ return next(err); }
});

// POST /api/doctor/schedule
router.post('/schedule', loadDoctor, async (req, res, next) => {
  try{
    const { ngay, ca, loaiCa = 'lam_viec', phongKhamId, lyDo, note } = req.body || {};
    if(!ngay || !ca) return res.status(400).json({ message: 'Thiếu ngày/ca' });
    const d = new Date(ngay);
    if(isNaN(d)) return res.status(400).json({ message: 'Ngày không hợp lệ' });
    const doc = await DoctorSchedule.create({ bacSiId: req.doctor._id, ngay: new Date(d.getFullYear(), d.getMonth(), d.getDate()), ca, loaiCa, phongKhamId, lyDo, note });
    res.status(201).json(doc);
  }catch(err){
    if(err && err.code===11000){ return res.status(409).json({ message: 'Đã có lịch cho ngày/ca này' }); }
    return next(err);
  }
});

// PUT /api/doctor/schedule/:id
router.put('/schedule/:id', loadDoctor, async (req, res, next) => {
  try{
    const { id } = req.params;
    const allow = ['ca','loaiCa','phongKhamId','lyDo','note','ngay'];
    const body = req.body || {};
    const update = {};
    for(const k of allow){ if(typeof body[k] !== 'undefined') update[k] = body[k]; }
    if(update.ngay){ const d = new Date(update.ngay); if(isNaN(d)) return res.status(400).json({ message: 'Ngày không hợp lệ' }); update.ngay = new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    const doc = await DoctorSchedule.findOneAndUpdate({ _id: id, bacSiId: req.doctor._id }, update, { new: true });
    if(!doc) return res.status(404).json({ message: 'Không tìm thấy lịch' });
    res.json(doc);
  }catch(err){
    if(err && err.code===11000){ return res.status(409).json({ message: 'Xung đột ngày/ca' }); }
    return next(err);
  }
});

// DELETE /api/doctor/schedule/:id
router.delete('/schedule/:id', loadDoctor, async (req, res, next) => {
  try{
    const { id } = req.params;
    const r = await DoctorSchedule.findOneAndDelete({ _id: id, bacSiId: req.doctor._id });
    if(!r) return res.status(404).json({ message: 'Không tìm thấy lịch' });
    res.json({ ok: true });
  }catch(err){ return next(err); }
});

// ===== Danh sách bệnh nhân trong ngày (theo lịch hẹn hoặc số thứ tự) =====
router.get('/today/patients', loadDoctor, async (req, res, next) => {
  try{
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);
    const appts = await LichKham.find({ bacSiId: req.doctor._id, ngayKham: { $gte: start, $lt: end } })
      .populate('benhNhanId', 'hoTen soDienThoai ngaySinh gioiTinh')
      .lean();
    const stts = await SoThuTu.find({ lichKhamId: { $in: appts.map(a=>a._id) } }).select('lichKhamId soThuTu trangThai').lean();
    const sttMap = stts.reduce((m,s)=>{ m[String(s.lichKhamId)] = s; return m; },{});
    const items = appts.map(a=>({
      _id: a._id,
      benhNhan: a.benhNhanId,
      khungGio: a.khungGio,
      trangThai: a.trangThai,
      soThuTu: sttMap[String(a._id)]?.soThuTu || null,
    }));
    // sort by soThuTu then khungGio
    items.sort((x,y)=>{
      const sx = x.soThuTu ?? 1e9; const sy = y.soThuTu ?? 1e9;
      if(sx!==sy) return sx-sy;
      return (x.khungGio||'').localeCompare(y.khungGio||'');
    });
    res.json(items);
  }catch(err){ return next(err); }
});

// ===== Chi tiết hồ sơ, cập nhật lâm sàng, kết thúc ca =====
router.get('/cases/:id', loadDoctor, async (req, res, next) => {
  try{
    const hs = await HoSoKham.findOne({ _id: req.params.id, bacSiId: req.doctor._id })
      .populate('benhNhanId','hoTen soDienThoai ngaySinh gioiTinh');
    if(!hs) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    res.json(hs);
  }catch(err){ return next(err); }
});

router.put('/cases/:id', loadDoctor, async (req, res, next) => {
  try{
    const allow = ['chanDoan','huongDieuTri','trieuChung','khamLamSang','sinhHieu','trangThai'];
    const body = req.body || {};
    const update = {};
    for(const k of allow){ if(typeof body[k] !== 'undefined') update[k] = body[k]; }
    const hs = await HoSoKham.findOneAndUpdate({ _id: req.params.id, bacSiId: req.doctor._id }, update, { new: true })
      .populate('benhNhanId','hoTen soDienThoai ngaySinh gioiTinh');
    if(!hs) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    res.json(hs);
  }catch(err){ return next(err); }
});

router.post('/cases/:id/complete', loadDoctor, async (req, res, next) => {
  try{
    const hs = await HoSoKham.findOneAndUpdate({ _id: req.params.id, bacSiId: req.doctor._id }, { trangThai: 'hoan_tat', ketThucLuc: new Date() }, { new: true });
    if(!hs) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    res.json(hs);
  }catch(err){ return next(err); }
});

// ===== Chỉ định cận lâm sàng và xem kết quả =====
router.post('/cases/:id/labs', loadDoctor, async (req, res, next) => {
  try{
    const { loaiChiDinh } = req.body || {};
    if(!loaiChiDinh) return res.status(400).json({ message: 'Thiếu loại chỉ định' });
    const hs = await HoSoKham.findOne({ _id: req.params.id, bacSiId: req.doctor._id });
    if(!hs) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    const c = await CanLamSang.create({ hoSoKhamId: hs._id, loaiChiDinh });
    res.status(201).json(c);
  }catch(err){ return next(err); }
});

router.get('/cases/:id/labs', loadDoctor, async (req, res, next) => {
  try{
    const hs = await HoSoKham.findOne({ _id: req.params.id, bacSiId: req.doctor._id });
    if(!hs) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    const items = await CanLamSang.find({ hoSoKhamId: hs._id }).sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ return next(err); }
});

// ===== Danh sách đơn thuốc của hồ sơ =====
router.get('/cases/:id/prescriptions', loadDoctor, async (req, res, next) => {
  try{
    const hs = await HoSoKham.findOne({ _id: req.params.id, bacSiId: req.doctor._id });
    if(!hs) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    const dons = await DonThuoc.find({ hoSoKhamId: hs._id }).sort({ createdAt: -1 });
    res.json(dons);
  }catch(err){ return next(err); }
});

// ===== Lịch sử khám của 1 bệnh nhân =====
router.get('/patients/:id/cases', loadDoctor, async (req, res, next) => {
  try{
    const limit = Math.min(parseInt(req.query.limit||'20',10), 50);
    const page = Math.max(parseInt(req.query.page||'1',10), 1);
    const [items, total] = await Promise.all([
      HoSoKham.find({ benhNhanId: req.params.id, bacSiId: req.doctor._id }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit)
        .populate('benhNhanId','hoTen soDienThoai ngaySinh gioiTinh'),
      HoSoKham.countDocuments({ benhNhanId: req.params.id, bacSiId: req.doctor._id })
    ]);
    res.json({ items, total, page, limit });
  }catch(err){ return next(err); }
});

module.exports = router;
