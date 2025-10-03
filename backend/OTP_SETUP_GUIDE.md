# Hướng dẫn thiết lập OTP qua Email

## Tổng quan

Hệ thống OTP (One-Time Password) được tích hợp để bảo mật quá trình đổi mật khẩu. Người dùng cần xác thực qua email trước khi có thể thay đổi mật khẩu.

## Quy trình OTP

1. **Bước 1**: Người dùng nhập mật khẩu hiện tại
2. **Bước 2**: Hệ thống gửi mã OTP (6 chữ số) về email đã đăng ký
3. **Bước 3**: Người dùng nhập mã OTP và mật khẩu mới
4. **Bước 4**: Hệ thống xác thực và cập nhật mật khẩu

## Cấu hình Email Server

### 1. Tạo App Password cho Gmail

1. Đăng nhập Gmail → Cài đặt tài khoản Google
2. Bảo mật → Xác minh 2 bước (bật nếu chưa có)
3. Mật khẩu ứng dụng → Tạo mật khẩu mới
4. Sao chép mật khẩu 16 ký tự

### 2. Cấu hình Backend

Tạo file `.env` từ `.env.example` và cập nhật:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com          # Email Gmail của bạn
EMAIL_PASS=abcd efgh ijkl mnop            # App Password (16 ký tự)
EMAIL_FROM_NAME=Hospital System
EMAIL_FROM_ADDRESS=noreply@hospital.com
```

### 3. Khởi động Backend

```bash
cd backend
npm install
npm start
```

## Tính năng OTP

- **Mã OTP**: 6 chữ số ngẫu nhiên
- **Thời gian hiệu lực**: 3 phút
- **Tự động xóa**: Mã OTP hết hạn sẽ tự động bị xóa khỏi database
- **Sử dụng một lần**: Mỗi mã OTP chỉ có thể sử dụng 1 lần

## API Endpoints

### 1. Yêu cầu mã OTP

```
POST /api/users/request-change-password-otp
Headers: Authorization: Bearer <token>
Body: {
  "currentPassword": "old_password"
}
```

### 2. Xác thực OTP và đổi mật khẩu

```
POST /api/users/verify-change-password-otp
Headers: Authorization: Bearer <token>
Body: {
  "otp": "123456",
  "newPassword": "new_password"
}
```

## Database Schema

### Otp Model

```javascript
{
  userId: ObjectId,        // ID người dùng
  email: String,           // Email nhận OTP
  otp: String,            // Mã OTP (6 chữ số)
  type: String,           // Loại OTP: 'change_password'
  isUsed: Boolean,        // Đã sử dụng chưa
  expiresAt: Date,        // Thời gian hết hạn
  createdAt: Date         // Thời gian tạo
}
```

## Xử lý lỗi thường gặp

### 1. Lỗi gửi email

- Kiểm tra EMAIL_USER và EMAIL_PASS
- Đảm bảo Gmail App Password đúng format
- Kiểm tra kết nối internet

### 2. OTP hết hạn

- Mã OTP có hiệu lực 3 phút
- Yêu cầu mã OTP mới nếu hết hạn

### 3. Mã OTP không hợp lệ

- Đảm bảo nhập đúng 6 chữ số
- Kiểm tra mã OTP chưa được sử dụng

## Bảo mật

- Mã OTP được mã hóa trước khi lưu database
- Tự động xóa mã OTP sau khi hết hạn
- Xác thực mật khẩu hiện tại trước khi gửi OTP
- Giới hạn thời gian sử dụng OTP (3 phút)

## Test Email Service

Backend có endpoint test kết nối email:

```javascript
// Trong emailService.js
const testEmailConnection = async () => {
  // Code test kết nối SMTP
};
```

Chạy test này để đảm bảo email service hoạt động đúng trước khi triển khai.
