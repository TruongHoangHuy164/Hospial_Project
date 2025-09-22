const express = require('express');
const BacSi = require('../models/BacSi');
const BenhNhan = require('../models/BenhNhan');
const HoSoKham = require('../models/HoSoKham');
const DonThuoc = require('../models/DonThuoc');
const CapThuoc = require('../models/CapThuoc');
const Thuoc = require('../models/Thuoc');

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

module.exports = router;
