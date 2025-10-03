# 👤 Chức năng Quản lý Thông tin Cá nhân

## 📋 **Tổng quan**

Chức năng cho phép người dùng quản lý và cập nhật thông tin cá nhân bao gồm:

- Họ tên, số điện thoại, địa chỉ, ngày tháng năm sinh
- Giới tính, mã BHYT
- Xây dựng dựa trên cấu trúc model đã có để tránh lỗi

## 🏗️ **Cấu trúc Implementation**

### **Backend APIs:**

#### 1. `GET /api/users/profile`

- **Mục đích:** Lấy thông tin profile đầy đủ của user hiện tại
- **Response:** Kết hợp data từ User model + BenhNhan model
- **Auto-create:** Tự động tạo BenhNhan profile nếu chưa có

#### 2. `PUT /api/users/profile`

- **Mục đích:** Cập nhật thông tin cá nhân
- **Validation:** Kiểm tra tất cả fields theo model schema
- **Update:** Cập nhật cả User.name và toàn bộ BenhNhan profile

### **Frontend Components:**

#### 1. `pages/user/Profile.jsx`

- **UI/UX:** Form hiện đại với validation real-time
- **Features:** Auto-save, error handling, responsive design
- **Integration:** Kết nối với backend APIs

#### 2. `components/UserMenu.jsx`

- **Dropdown menu:** Hiển thị user info và navigation links
- **Accessibility:** Keyboard navigation, click outside close
- **Links:** Direct access to profile và các chức năng khác

## 📊 **Data Structure**

### **User Model (Existing):**

```javascript
{
  name: String (required),
  email: String (required, unique),
  role: String (enum),
  // ... auth fields
}
```

### **BenhNhan Model (Existing):**

```javascript
{
  userId: ObjectId (ref User),
  hoTen: String (required),
  ngaySinh: Date,
  gioiTinh: String (enum: ['nam', 'nu', 'khac']),
  diaChi: String,
  soDienThoai: String,
  maBHYT: String
}
```

### **Combined Profile Response:**

```javascript
{
  // User fields
  id,
    email,
    role,
    createdAt,
    // BenhNhan fields
    hoTen,
    ngaySinh,
    gioiTinh,
    diaChi,
    soDienThoai,
    maBHYT,
    benhNhanId;
}
```

## ✅ **Validation Rules**

### **Backend Validation:**

- ✅ `hoTen`: Required, không được rỗng
- ✅ `gioiTinh`: Enum ['nam', 'nu', 'khac']
- ✅ `ngaySinh`: Valid date, không thể là tương lai
- ✅ `soDienThoai`: Regex pattern 10-15 digits
- ✅ All other fields: Optional

### **Frontend Validation:**

- ✅ Real-time validation khi user nhập liệu
- ✅ Error messages hiển thị ngay lập tức
- ✅ Prevent submit nếu có lỗi validation
- ✅ Clear errors khi user sửa input

## 🛣️ **Navigation & Routes**

### **Routes Added:**

```javascript
// App.jsx
<Route path="/user/profile" element={<UserProfile />} />
```

### **Navigation Access:**

1. **Navbar UserMenu dropdown** → "Thông tin cá nhân"
2. **Direct URL:** `/user/profile`
3. **Auth Required:** User phải đăng nhập

## 🔧 **Key Features**

### **1. Auto Profile Creation**

- User đăng nhập lần đầu → Auto-create BenhNhan profile
- Sync User.name với BenhNhan.hoTen
- Không cần manual setup

### **2. Real-time Validation**

- Validate ngay khi user nhập
- Hiển thị error messages chi tiết
- Prevent invalid data submission

### **3. Responsive Design**

- Mobile-friendly form layout
- Grid system tự động adjust
- Touch-optimized controls

### **4. Error Handling**

- Network error handling
- Server validation errors
- User-friendly error messages
- Loading states

## 🧪 **Testing Instructions**

### **1. Start Servers:**

```bash
# Backend
cd backend && node src/index.js

# Frontend
cd frontend && npm run dev
```

### **2. Test Scenarios:**

#### **New User Profile:**

1. Đăng nhập với user mới
2. Navigate to `/user/profile`
3. Verify auto-created profile with basic info
4. Update all fields and save
5. Verify data persistence

#### **Existing User Update:**

1. Đăng nhập với user đã có profile
2. Load profile page
3. Modify various fields
4. Test validation (invalid phone, future birth date)
5. Save and verify updates

#### **Validation Testing:**

1. Leave `hoTen` empty → Error
2. Enter invalid phone → Error
3. Select future birth date → Error
4. All other fields should be optional

### **3. Expected Results:**

- ✅ Profile loads correctly with existing/auto-created data
- ✅ All form validations work properly
- ✅ Updates save successfully to database
- ✅ Error handling works for network/server issues
- ✅ Mobile responsive design
- ✅ Navigation menu includes profile link

## 📋 **Files Created/Modified:**

### **Backend:**

- ✅ `routes/users.js` - Added profile GET/PUT endpoints

### **Frontend:**

- ✅ `pages/user/Profile.jsx` - Main profile management page
- ✅ `components/UserMenu.jsx` - User dropdown menu
- ✅ `components/Navbar.jsx` - Integrated UserMenu
- ✅ `App.jsx` - Added profile route

## 🎯 **Benefits:**

1. **User Experience:** Intuitive profile management interface
2. **Data Integrity:** Robust validation prevents invalid data
3. **Auto Management:** No manual profile setup required
4. **Responsive:** Works on all device sizes
5. **Integration:** Seamlessly integrated with existing auth system
6. **Scalable:** Easy to extend with additional profile fields

**Status: 🟢 COMPLETE & READY FOR USE**
