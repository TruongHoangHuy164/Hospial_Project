const express = require('express');
const User = require('../models/User');
const BenhNhan = require('../models/BenhNhan');
const ThanhToan = require('../models/ThanhToan');

const router = express.Router();

// GET /api/admin/overview
router.get('/overview', async (req, res, next) => {
  try {
    const onlineWindowMinutes = 10; // consider users active within last 10 minutes as online
    const since = new Date(Date.now() - onlineWindowMinutes * 60 * 1000);

    const [usersCount, patientsCount, latestBenhNhan, onlineCounts] = await Promise.all([
      User.countDocuments({}),
      BenhNhan.countDocuments({}),
      BenhNhan.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select('hoTen gioiTinh ngaySinh createdAt'),
      User.aggregate([
        { $match: { lastActive: { $gte: since } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    // Map to frontend expected keys
    const latestPatients = latestBenhNhan.map((p) => ({
      _id: p._id,
      fullName: p.hoTen,
      gender: p.gioiTinh,
      dob: p.ngaySinh,
      createdAt: p.createdAt,
    }));

    const onlineByRole = { user: 0, doctor: 0, admin: 0 };
    for (const o of onlineCounts) {
      if (o?._id && onlineByRole.hasOwnProperty(o._id)) onlineByRole[o._id] = o.count;
    }

    // Revenue series: last 14 days sum of soTien by day
    const days = 14;
    const from = new Date(); from.setHours(0,0,0,0); from.setDate(from.getDate() - (days - 1));
    const revenueAgg = await ThanhToan.aggregate([
      { $match: { ngayThanhToan: { $gte: from } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$ngayThanhToan' } },
          total: { $sum: '$soTien' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const revenueMap = new Map(revenueAgg.map(r => [r._id, r.total]));
    const revenue = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from); d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0,10);
      revenue.push({ date: key, total: revenueMap.get(key) || 0 });
    }

    return res.json({
      usersCount,
      patientsCount,
      latestPatients,
      onlineByRole,
      revenue,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
