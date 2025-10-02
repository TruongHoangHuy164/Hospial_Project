const express = require('express');
const PatientProfile = require('../models/PatientProfile');
const auth = require('../middlewares/auth');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// @desc    Lấy tất cả hồ sơ của người dùng đang đăng nhập
// @route   GET /api/patient-profiles
// @access  Private
router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    console.log('Backend: Fetching profiles for user:', req.user.id);
    const profiles = await PatientProfile.find({ id_nguoiTao: req.user.id });
    console.log('Backend: Found profiles:', profiles.length);
    res.json(profiles);
  })
);

// @desc    Tạo hồ sơ bệnh nhân mới
// @route   POST /api/patient-profiles
// @access  Private
router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const {
      hoTen,
      ngaySinh,
      gioiTinh,
      soDienThoai,
      email,
      cccd,
      hoChieu,
      quocGia,
      danToc,
      ngheNghiep,
      tinhThanh,
      quanHuyen,
      phuongXa,
      diaChi,
      quanHe,
    } = req.body;

    console.log('Backend: Creating profile for user:', req.user.id);
    console.log('Backend: Profile data:', { hoTen, ngaySinh, gioiTinh, quanHe });
    
    const profile = new PatientProfile({
      id_nguoiTao: req.user.id,
      hoTen,
      ngaySinh,
      gioiTinh,
      soDienThoai,
      email,
      cccd,
      hoChieu,
      quocGia,
      danToc,
      ngheNghiep,
      tinhThanh,
      quanHuyen,
      phuongXa,
      diaChi,
      quanHe,
    });

    const createdProfile = await profile.save();
    console.log('Backend: Profile created successfully:', createdProfile._id);
    res.status(201).json(createdProfile);
  })
);

// @desc    Lấy chi tiết hồ sơ theo ID
// @route   GET /api/patient-profiles/:id
// @access  Private
router.get(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const profile = await PatientProfile.findById(req.params.id);

    if (profile && profile.id_nguoiTao.toString() === req.user.id.toString()) {
      res.json(profile);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy hồ sơ hoặc bạn không có quyền truy cập');
    }
  })
);

// @desc    Cập nhật hồ sơ
// @route   PUT /api/patient-profiles/:id
// @access  Private
router.put(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const profile = await PatientProfile.findById(req.params.id);

    if (profile && profile.id_nguoiTao.toString() === req.user.id.toString()) {
      const {
        hoTen,
        ngaySinh,
        gioiTinh,
        soDienThoai,
        email,
        cccd,
        hoChieu,
        quocGia,
        danToc,
        ngheNghiep,
        tinhThanh,
        quanHuyen,
        phuongXa,
        diaChi,
        quanHe,
      } = req.body;

      profile.hoTen = hoTen || profile.hoTen;
      profile.ngaySinh = ngaySinh || profile.ngaySinh;
      profile.gioiTinh = gioiTinh || profile.gioiTinh;
      profile.soDienThoai = soDienThoai || profile.soDienThoai;
      profile.email = email || profile.email;
      profile.cccd = cccd || profile.cccd;
      profile.hoChieu = hoChieu || profile.hoChieu;
      profile.quocGia = quocGia || profile.quocGia;
      profile.danToc = danToc || profile.danToc;
      profile.ngheNghiep = ngheNghiep || profile.ngheNghiep;
      profile.tinhThanh = tinhThanh || profile.tinhThanh;
      profile.quanHuyen = quanHuyen || profile.quanHuyen;
      profile.phuongXa = phuongXa || profile.phuongXa;
      profile.diaChi = diaChi || profile.diaChi;
      profile.quanHe = quanHe || profile.quanHe;

      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy hồ sơ hoặc bạn không có quyền truy cập');
    }
  })
);

// @desc    Xóa hồ sơ
// @route   DELETE /api/patient-profiles/:id
// @access  Private
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const profile = await PatientProfile.findById(req.params.id);

    if (profile && profile.id_nguoiTao.toString() === req.user.id.toString()) {
      await profile.deleteOne(); // Using deleteOne() instead of remove()
      res.json({ message: 'Hồ sơ đã được xóa' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy hồ sơ hoặc bạn không có quyền truy cập');
    }
  })
);

module.exports = router;
