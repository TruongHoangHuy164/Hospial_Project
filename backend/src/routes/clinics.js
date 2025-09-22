const express = require('express');
const PhongKham = require('../models/PhongKham');

const router = express.Router();

// GET /api/clinics?q=&limit=&page=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
    const skip = (page - 1) * limit;
  const q = (req.query.q || '').trim();
  const chuyenKhoaId = (req.query.chuyenKhoaId || '').trim();
  const filter = q ? { $or: [ { tenPhong: { $regex: q, $options: 'i' } }, { chuyenKhoa: { $regex: q, $options: 'i' } } ] } : {};
  if (chuyenKhoaId) filter.chuyenKhoaId = chuyenKhoaId;
    const [items, total] = await Promise.all([
      PhongKham.find(filter).populate('chuyenKhoaId', 'ten').sort({ tenPhong: 1 }).skip(skip).limit(limit),
      PhongKham.countDocuments(filter)
    ]);
    res.json({ items, total, page, limit, totalPages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
});

// POST /api/clinics
router.post('/', async (req, res, next) => {
  try {
    const { tenPhong, chuyenKhoa, chuyenKhoaId } = req.body || {};
    if (!tenPhong || !chuyenKhoa) return res.status(400).json({ message: 'Thiếu tên phòng/chuyên khoa' });
    const created = await PhongKham.create({ tenPhong, chuyenKhoa, chuyenKhoaId: chuyenKhoaId || undefined });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// PUT /api/clinics/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { tenPhong, chuyenKhoa, chuyenKhoaId } = req.body || {};
    const update = { tenPhong, chuyenKhoa };
    if (typeof chuyenKhoaId !== 'undefined') update.chuyenKhoaId = chuyenKhoaId || undefined;
    const updated = await PhongKham.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/clinics/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await PhongKham.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (err) { next(err); }
});

module.exports = router;
