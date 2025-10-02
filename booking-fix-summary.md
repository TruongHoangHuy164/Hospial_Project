# Sửa lỗi đặt lịch khám - LichKham validation failed

## 🔍 **Vấn đề:**

- Lỗi `Error: LichKham validation failed: benhNhanId: Path 'benhNhanId' is required.`
- Backend model `LichKham` yêu cầu `benhNhanId` bắt buộc, nhưng logic đặt lịch cho người thân chỉ gửi `hoSoBenhNhanId`

## ✅ **Các sửa chữa đã thực hiện:**

### 1. **Backend - routes/booking.js:**

- ✅ Thêm logging để debug
- ✅ Tạo `BenhNhan` record từ `PatientProfile` khi đặt lịch cho người thân
- ✅ Đảm bảo `benhNhanId` luôn có giá trị trong `LichKham`
- ✅ Cải thiện validation và error handling

### 2. **Frontend - pages/booking/Index.jsx:**

- ✅ Thêm kiểm tra bắt buộc chọn hồ sơ
- ✅ Thêm logging để debug data flow
- ✅ Cải thiện error handling và user feedback

## 🔧 **Logic xử lý mới:**

### Đặt lịch cho bản thân:

```javascript
// Frontend gửi
{
  benhNhanId: "user_patient_id";
}
// Backend sử dụng trực tiếp
```

### Đặt lịch cho người thân:

```javascript
// Frontend gửi
{
  hoSoBenhNhanId: "patient_profile_id";
}
// Backend tự động:
// 1. Lấy thông tin từ PatientProfile
// 2. Tạo BenhNhan record mới
// 3. Gán benhNhanId vào LichKham
```

## 🧪 **Testing:**

1. **Khởi động servers:**

   ```bash
   # Backend
   cd backend && node src/index.js

   # Frontend
   cd frontend && npm run dev
   ```

2. **Test cases:**

   - [ ] Đặt lịch cho bản thân (selectedProfileId = 'self')
   - [ ] Đặt lịch cho người thân (selectedProfileId = profile_id)
   - [ ] Kiểm tra console logs để debug

3. **Expected result:**
   - Không còn lỗi validation
   - Lịch khám được tạo thành công
   - Queue number được generate đúng

## 📝 **Notes:**

- Model `LichKham` yêu cầu cả `benhNhanId` và `hoSoBenhNhanId` nhưng chỉ một trong hai sẽ có giá trị
- `benhNhanId` luôn được populate để thỏa mãn schema requirements
- Hệ thống hỗ trợ cả việc đặt lịch cho bản thân và người thân
