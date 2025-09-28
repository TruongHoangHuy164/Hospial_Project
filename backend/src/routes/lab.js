const express = require('express');
const CanLamSang = require('../models/CanLamSang');
const HoSoKham = require('../models/HoSoKham');
const BenhNhan = require('../models/BenhNhan');

const router = express.Router();

// List pending orders
// GET /api/lab/orders?status=cho_thuc_hien|dang_thuc_hien|da_xong
router.get('/orders', async (req, res, next) => {
  try{
    const { status } = req.query;
    const filter = {};
    if(status) filter.trangThai = status;
    const items = await CanLamSang.find(filter).sort({ createdAt: -1 }).limit(100)
      .populate({ path:'hoSoKhamId', select:'benhNhanId bacSiId', populate: { path:'benhNhanId', select:'hoTen soDienThoai' } });
    res.json(items);
  }catch(err){ return next(err); }
});

// Claim/Start an order
// POST /api/lab/orders/:id/start
router.post('/orders/:id/start', async (req, res, next) => {
  try{
    const u = req.user;
    const doc = await CanLamSang.findByIdAndUpdate(req.params.id, { $set: { trangThai: 'dang_thuc_hien', nhanVienId: u?.id, ngayThucHien: new Date() } }, { new: true });
    if(!doc) return res.status(404).json({ message: 'Không tìm thấy chỉ định' });
    res.json(doc);
  }catch(err){ return next(err); }
});

// Submit result
// POST /api/lab/orders/:id/complete
router.post('/orders/:id/complete', async (req, res, next) => {
  try{
    const { ketQua } = req.body || {};
    const doc = await CanLamSang.findByIdAndUpdate(req.params.id, { $set: { ketQua: ketQua||'', trangThai: 'da_xong' } }, { new: true });
    if(!doc) return res.status(404).json({ message: 'Không tìm thấy chỉ định' });
    res.json(doc);
  }catch(err){ return next(err); }
});

module.exports = router;
