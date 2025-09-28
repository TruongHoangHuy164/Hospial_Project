const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users?page=1&limit=10&q=abc&role=admin
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();
    const role = (req.query.role || '').trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpires -refreshTokenIds')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

// PATCH /api/users/:id/role
router.patch('/:id/role', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

  const allowed = ['user', 'doctor', 'admin', 'reception', 'lab'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    // Optional safety: prevent current admin from demoting themselves to avoid lockout
    if (req.user && req.user.id === id && req.user.role === 'admin' && role !== 'admin') {
      return res.status(400).json({ message: 'Không thể tự hạ quyền chính mình' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, projection: '-password -resetPasswordToken -resetPasswordExpires -refreshTokenIds' }
    );
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    return res.json({ message: 'Cập nhật vai trò thành công', user });
  } catch (err) {
    return next(err);
  }
});
