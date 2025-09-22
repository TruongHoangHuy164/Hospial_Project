# Hospital Backend (Node.js, no MVC)

Simple Express server with minimal structure.

## Scripts

- `npm run dev` – start with nodemon on `http://localhost:5000`
- `npm start` – start with Node

## Setup

1. Copy `.env.example` to `.env` and adjust as needed
2. Install dependencies

```
npm install
```

3. Run

```
npm run dev
```

## MongoDB

Set `MONGODB_URI` in `.env`, e.g.:

```
MONGODB_URI=mongodb://127.0.0.1:27017/hospital_demo
```

Start local MongoDB (example, if you have MongoDB installed):

```
mongod --dbpath "C:\\data\\db"
```

Health check will include DB status at `GET /health`:

```
{
	"status": "up",
	"db": "connected"
}
```

## Endpoints

- `GET /` – base info
- `GET /health` – health check
- Patients CRUD under `/api/patients`
	- `POST /api/patients`
	- `GET /api/patients`
	- `GET /api/patients/:id`
	- `PUT /api/patients/:id`
	- `DELETE /api/patients/:id`

### Auth

- `POST /api/auth/register`
	- body: `{ "name": "User Name", "email": "user@example.com", "password": "secret123" }`
	- response: `{ user: { id, name, email, role }, accessToken, refreshToken }`

- `POST /api/auth/login`
	- body: `{ "email": "user@example.com", "password": "secret123" }`
	- response: `{ user: { id, name, email, role }, accessToken, refreshToken }`

- `GET /api/profile` (requires header `Authorization: Bearer <token>`)
	- response: `{ user: { id, email, name, iat, exp } }`

- `POST /api/auth/refresh`
	- body: `{ "refreshToken": "..." }`
	- response: `{ accessToken, refreshToken }` (rotation)

- `POST /api/auth/logout`
	- body: `{ "refreshToken": "..." }`
	- response: `{ message }` (revokes the provided refresh token)

- `POST /api/auth/forgot-password`
	- body: `{ "email": "user@example.com" }`
	- response: `{ message, resetToken }` (token returned for testing; normally emailed)

- `POST /api/auth/reset-password`
	- body: `{ "token": "...", "password": "newpass" }`
	- response: `{ message }`

Environment variables for auth:

```
JWT_SECRET=change_this_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=change_this_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=30d
```

## Mini Clinic Database (7-step workflow)

Collections and relations:

- `BenhNhan` (patient)
	- Fields: `hoTen, ngaySinh, gioiTinh(nam|nu|khac), diaChi, soDienThoai`
	- Relations: 1–n with `SoThuTu`, 1–1 or 1–n with `BHYT`, 1–n with `HoSoKham`

- `SoThuTu` (queue ticket)
	- Fields: `benhNhanId -> BenhNhan, soThuTu, thoiGianDangKy, trangThai(dang_cho|da_goi|da_kham)`

- `BHYT` (health insurance)
	- Fields: `benhNhanId -> BenhNhan, maTheBHYT(unique), ngayBatDau, ngayHetHan, giayChuyenVien(boolean)`

- `PhongKham` (clinic room)
	- Fields: `tenPhong, chuyenKhoa`
	- Relations: 1–n with `BacSi`

- `BacSi` (doctor)
	- Fields: `hoTen, chuyenKhoa, phongKhamId -> PhongKham`

- `HoSoKham` (visit/encounter)
	- Fields: `benhNhanId -> BenhNhan, bacSiId -> BacSi, ngayKham, chanDoan, huongDieuTri(ngoai_tru|noi_tru|chuyen_vien|ke_don)`
	- Relations: 1–n with `CanLamSang`, `DonThuoc`, `ThanhToan`

- `CanLamSang` (para-clinical order)
	- Fields: `hoSoKhamId -> HoSoKham, loaiChiDinh(xet_nghiem|sieu_am|x_quang|ct|mri|dien_tim|noi_soi), ketQua, ngayThucHien`

- `ThanhToan` (payment)
	- Fields: `hoSoKhamId -> HoSoKham, soTien, hinhThuc(BHYT|tien_mat), ngayThanhToan`

- `DonThuoc` (prescription)
	- Fields: `hoSoKhamId -> HoSoKham, ngayKeDon`
	- Relations: 1–n with `CapThuoc`

- `Thuoc` (drug)
	- Fields: `tenThuoc, donViTinh, huongDanSuDung`

- `CapThuoc` (dispense)
	- Fields: `donThuocId -> DonThuoc, thuocId -> Thuoc, soLuong`

All schemas are defined under `src/models` with Mongoose refs and helpful indexes.