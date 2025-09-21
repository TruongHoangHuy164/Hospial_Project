const express = require('express');
const User = require('../models/User');
const Patient = require('../models/Patient');

const router = express.Router();

// GET /api/admin/overview
router.get('/overview', async (req, res, next) => {
  try {
    const [usersCount, patientsCount, latestPatients] = await Promise.all([
      User.countDocuments({}),
      Patient.countDocuments({}),
      Patient.find({}).sort({ createdAt: -1 }).limit(8).select('fullName gender dob createdAt'),
    ]);

    return res.json({
      usersCount,
      patientsCount,
      latestPatients,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
