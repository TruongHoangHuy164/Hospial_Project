# Test Booking Fix - Final Version

## 🔍 **Root Cause:**

- Frontend gọi API `/api/users/my-patient-profile` nhưng API này không tồn tại
- `selfProfile` luôn là null, khiến việc book cho bản thân thất bại
- Khi `selectedProfileId = 'self'` và `selfProfile = null`, không có `benhNhanId` được gửi
- Backend validation `benhNhanId` required bị fail

## ✅ **Các thay đổi đã thực hiện:**

### 1. **Backend - routes/users.js:**

- ✅ Thêm import `BenhNhan` model và `auth` middleware
- ✅ Tạo API `GET /api/users/my-patient-profile`
- ✅ Tự động tạo BenhNhan profile từ User data nếu chưa có
- ✅ Return BenhNhan profile để frontend sử dụng làm self profile

### 2. **Backend - routes/booking.js:**

- ✅ Thêm import PatientProfile model
- ✅ Sửa logic mapping gioiTinh (Nam/Nữ/Khác → nam/nu/khac)
- ✅ Thêm comprehensive error handling và logging
- ✅ Wrap BenhNhan creation trong try-catch riêng

### 3. **Frontend - pages/booking/Index.jsx:**

- ✅ Sử dụng đúng API `/api/users/my-patient-profile`
- ✅ Thêm logging để debug self profile loading
- ✅ Proper error handling khi không có self profile

## 🔧 **Logic hoạt động mới:**

### **User has BenhNhan profile:**

- API `/api/users/my-patient-profile` return existing BenhNhan
- Frontend set `selfProfile` và default `selectedProfileId = 'self'`
- Khi book: gửi `benhNhanId = selfProfile._id`

### **User chưa có BenhNhan profile:**

- API tự động tạo BenhNhan từ User data (name, phone)
- Return BenhNhan profile mới tạo
- Frontend hoạt động bình thường

### **Book cho người thân:**

- Vẫn hoạt động như cũ với `hoSoBenhNhanId`
- Backend tạo BenhNhan từ PatientProfile data

## 🧪 \*\*Để test:

1. **Khởi động backend:**

```bash
cd backend && node src/index.js
```

2. **Khởi động frontend:**

```bash
cd frontend && npm run dev
```

3. **Test cases:**

- Đặt lịch cho bản thân (selectedProfileId = 'self')
- Đặt lịch cho người thân (chọn một profile từ danh sách)

4. **Kiểm tra:**

- Console logs trong backend để debug
- Network tab trong browser để xem API response
- Không còn lỗi "benhNhanId is required"

## Expected behavior:

### Khi đặt lịch cho bản thân:

- `benhNhanId` được gửi trực tiếp từ frontend
- Backend sử dụng benhNhanId này

### Khi đặt lịch cho người thân:

- `hoSoBenhNhanId` được gửi từ frontend
- Backend tự động:
  1. Tìm PatientProfile theo hoSoBenhNhanId
  2. Tạo BenhNhan record mới từ PatientProfile data
  3. Sử dụng BenhNhan.\_id làm benhNhanId trong LichKham
  4. Lưu cả hoSoBenhNhanId và benhNhanId trong LichKham

Điều này đảm bảo schema requirement được thỏa mãn trong khi vẫn hỗ trợ cả hai loại booking.
