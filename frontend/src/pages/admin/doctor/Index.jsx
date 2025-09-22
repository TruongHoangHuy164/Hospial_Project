import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Doctors() {
  const hocViOptions = ['BS','BSCKI','BSCKII','ThS','TS','PGS','GS'];
  const chucDanhOptions = ['Trưởng khoa', 'Bác sĩ điều trị'];
  const [items, setItems] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    hoTen: '',
    chuyenKhoa: '',
    phongKhamId: '',
    gioiTinh: 'khac',
    ngaySinh: '',
    soDienThoai: '',
    email: '',
    maSo: '',
    diaChi: '',
    hocVi: '',
    chucDanh: '',
    namKinhNghiem: '',
    anhDaiDien: '',
    moTa: '',
    trangThai: 'dang_cong_tac',
  });
  const [clinics, setClinics] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  }), []);

  async function loadClinics() {
    try {
      const url = new URL(`${API_URL}/api/clinics`);
      url.searchParams.set('limit', '200');
      const res = await fetch(url, { headers });
      const json = await res.json();
      if (!res.ok) throw json;
      setClinics(json.items || []);
    } catch {}
  }

  async function load() {
    setLoading(true); setError('');
    try {
      const url = new URL(`${API_URL}/api/doctors`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(limit));
      if (q) url.searchParams.set('q', q);
      const res = await fetch(url, { headers });
      const json = await res.json();
      if (!res.ok) throw json;
      setItems(json.items || []);
      setTotalPages(json.totalPages || 1);
    } catch (e) { setError(e?.message || 'Lỗi tải danh sách'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, limit]);
  useEffect(() => { loadClinics(); }, []);
  useEffect(() => { // load specialties for dropdown
    (async () => {
      try {
        const url = new URL(`${API_URL}/api/specialties`);
        url.searchParams.set('limit', '200');
        const res = await fetch(url, { headers });
        const json = await res.json();
        if (!res.ok) throw json;
        setSpecialties(json.items || []);
      } catch {}
    })();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      hoTen: '', chuyenKhoa: '', phongKhamId: clinics[0]?._id || '', gioiTinh: 'khac', ngaySinh: '', soDienThoai: '', email: '',
      maSo: '', diaChi: '', hocVi: '', chucDanh: '', namKinhNghiem: '', anhDaiDien: '', moTa: '', trangThai: 'dang_cong_tac',
    });
    setShowModal(true);
  }

  function openEdit(bs) {
    setEditing(bs);
    setForm({
      hoTen: bs.hoTen || '',
      chuyenKhoa: bs.chuyenKhoa || '',
      phongKhamId: (bs.phongKhamId?._id || bs.phongKhamId || ''),
      gioiTinh: bs.gioiTinh || 'khac',
      ngaySinh: bs.ngaySinh ? String(bs.ngaySinh).slice(0,10) : '',
      soDienThoai: bs.soDienThoai || '',
      email: bs.email || '',
      maSo: bs.maSo || '',
      diaChi: bs.diaChi || '',
      hocVi: bs.hocVi || '',
      chucDanh: bs.chucDanh || '',
      namKinhNghiem: (bs.namKinhNghiem ?? '') + '',
      anhDaiDien: bs.anhDaiDien || '',
      moTa: bs.moTa || '',
      trangThai: bs.trangThai || 'dang_cong_tac',
    });
    setShowModal(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Coerce types and clean up blanks
      if (payload.namKinhNghiem !== '' && payload.namKinhNghiem != null) {
        const n = parseInt(payload.namKinhNghiem, 10);
        payload.namKinhNghiem = isNaN(n) ? undefined : n;
      } else {
        delete payload.namKinhNghiem;
      }
      // remove empty optional fields to avoid unique index conflicts on "" (email)
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
      if (!payload.phongKhamId && clinics[0]) payload.phongKhamId = clinics[0]._id;
      // If chuyenKhoa not provided, derive from selected clinic
      if (!payload.chuyenKhoa && payload.phongKhamId) {
        const c = clinics.find(x => x._id === payload.phongKhamId);
        if (c) payload.chuyenKhoa = (c.chuyenKhoaId?.ten) || c.chuyenKhoa;
      }
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${API_URL}/api/doctors/${editing._id}` : `${API_URL}/api/doctors`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw json;
      setShowModal(false);
      await load();
    } catch (e) { alert(e?.message || 'Lưu thất bại'); }
  }

  async function removeDoctor(id) {
    if (!confirm('Xóa bác sĩ này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/doctors/${id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!res.ok) throw json;
      await load();
    } catch (e) { alert(e?.message || 'Xóa thất bại'); }
  }

  async function provisionAccount(id) {
    try {
      const res = await fetch(`${API_URL}/api/doctors/${id}/provision-account`, { method: 'POST', headers });
      const json = await res.json();
      if (!res.ok) throw json;
      alert(json?.message || 'Đã cấp tài khoản cho bác sĩ');
      await load();
    } catch (e) { alert(e?.message || 'Cấp tài khoản thất bại'); }
  }

  const onUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const headersNoJson = { Authorization: headers.Authorization };
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/uploads/image`, { method: 'POST', headers: headersNoJson, body: formData });
      const json = await res.json();
      if (!res.ok) throw json;
      setForm(f => ({ ...f, anhDaiDien: json.url }));
    } catch (err) {
      alert(err?.message || 'Upload ảnh thất bại');
    } finally {
      e.target.value = '';
    }
  };

  // helpers
  const fmtDate = (v) => (v ? String(v).slice(0, 10) : '-');
  const fmtGender = (g) => (g === 'nam' ? 'Nam' : g === 'nu' ? 'Nữ' : g ? 'Khác' : '-');
  const toAbsoluteUrl = (u) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    const path = u.startsWith('/') ? u : `/${u}`;
    return `${API_URL}${path}`;
  };

  return (
    <div>
      <h3 className="mb-3">Quản lý bác sĩ</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-3">
        <div className="col-md-5 d-flex gap-2">
          <button className="btn btn-success" onClick={openCreate}><i className="bi bi-plus-circle"></i> Thêm bác sĩ</button>
        </div>
        <div className="col-md-7 d-flex gap-2">
          <input className="form-control" placeholder="Tìm theo họ tên" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ setPage(1); load(); } }} />
          <button className="btn btn-primary" onClick={()=>{ setPage(1); load(); }} disabled={loading}><i className="bi bi-search"></i> Tìm</button>
          <select className="form-select" value={limit} onChange={(e)=>{ setLimit(parseInt(e.target.value,10)); setPage(1); }} style={{ maxWidth: 140 }}>
            {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/trang</option>)}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-sm align-middle table-hover">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Chuyên khoa</th>
              <th>Phòng khám</th>
              <th>Mã số</th>
              <th>Học vị</th>
              <th>Chức danh</th>
              <th className="text-nowrap">Năm KN</th>
              <th className="text-nowrap">Giới tính</th>
              <th className="text-nowrap">Ngày sinh</th>
              <th className="text-nowrap">SĐT</th>
              <th>Địa chỉ</th>
              <th className="text-center text-nowrap">Ảnh</th>
              <th>Mô tả</th>
              <th>Email (BS)</th>
              <th>Email tài khoản</th>
              <th className="text-nowrap">Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(bs => (
              <tr key={bs._id}>
                <td>{bs.hoTen}</td>
                <td>{bs.chuyenKhoa}</td>
                <td>{bs.phongKhamId?.tenPhong || bs.phongKhamId}</td>
                <td>{bs.maSo || '-'}</td>
                <td>{bs.hocVi || '-'}</td>
                <td>{bs.chucDanh || '-'}</td>
                <td>{bs.namKinhNghiem ?? '-'}</td>
                <td>{fmtGender(bs.gioiTinh)}</td>
                <td>{fmtDate(bs.ngaySinh)}</td>
                <td>{bs.soDienThoai || '-'}</td>
                <td className="text-truncate" style={{ maxWidth: 200 }} title={bs.diaChi || ''}>{bs.diaChi || '-'}</td>
                <td className="text-center" style={{ width: 56 }}>{bs.anhDaiDien ? (<img src={toAbsoluteUrl(bs.anhDaiDien)} alt="avatar" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%' }} />) : '-'}</td>
                <td className="text-truncate" style={{ maxWidth: 240 }} title={bs.moTa || ''}>{bs.moTa || '-'}</td>
                <td>{bs.email || <span className="text-muted">-</span>}</td>
                <td>{bs.userId?.email || <span className="text-muted">Chưa có</span>}</td>
                <td>{bs.trangThai || '-'}</td>
                <td className="text-end d-flex gap-2 justify-content-end">
                 {!bs.userId && (
                    <button className="btn btn-sm btn-outline-primary" onClick={()=>provisionAccount(bs._id)}>
                      Cấp tài khoản
                    </button>
                        )}
                <button className="btn btn-sm btn-outline-secondary" onClick={()=>openEdit(bs)}>Sửa</button>
                <button className="btn btn-sm btn-outline-danger" onClick={()=>removeDoctor(bs._id)}>Xóa</button>
                  
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="text-center">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <div>Trang {page}/{totalPages}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Trước</button>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Sau</button>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Cập nhật bác sĩ' : 'Thêm bác sĩ'}</h5>
                <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
              </div>
              <form onSubmit={submitForm}>
                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label">Họ tên</label>
                      <input className="form-control" value={form.hoTen} onChange={(e)=>setForm(f=>({...f, hoTen:e.target.value}))} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Chuyên khoa</label>
                      <select className="form-select" value={form.chuyenKhoa} onChange={(e)=>{
                        const val = e.target.value;
                        setForm(f=>({...f, chuyenKhoa: val }));
                      }} required>
                        <option value="">-- Chọn chuyên khoa --</option>
                        {specialties.map(s => <option key={s._id} value={s.ten}>{s.ten}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phòng khám</label>
                      <select className="form-select" value={form.phongKhamId} onChange={(e)=>{
                        const val = e.target.value;
                        const c = clinics.find(x => x._id === val);
                        setForm(f=>({
                          ...f,
                          phongKhamId: val,
                          chuyenKhoa: c ? ((c.chuyenKhoaId?.ten) || c.chuyenKhoa || f.chuyenKhoa) : f.chuyenKhoa
                        }));
                      }} required>
                        <option value="">-- Chọn phòng khám --</option>
                        {clinics.map(c => <option key={c._id} value={c._id}>{c.tenPhong} - {c.chuyenKhoa}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Mã số (nếu có)</label>
                      <input className="form-control" value={form.maSo} onChange={(e)=>setForm(f=>({...f, maSo:e.target.value}))} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Chức danh</label>
                      <select className="form-select" value={form.chucDanh} onChange={(e)=>setForm(f=>({...f, chucDanh:e.target.value}))}>
                        <option value="">-- Chọn chức danh --</option>
                        {chucDanhOptions.map(v => <option key={v} value={v}>{v}</option>)}
                        {form.chucDanh && !chucDanhOptions.includes(form.chucDanh) && (
                          <option value={form.chucDanh}>{form.chucDanh}</option>
                        )}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Học vị</label>
                      <select className="form-select" value={form.hocVi} onChange={(e)=>setForm(f=>({...f, hocVi:e.target.value}))}>
                        <option value="">-- Chọn học vị --</option>
                        {hocViOptions.map(v => <option key={v} value={v}>{v}</option>)}
                        {form.hocVi && !hocViOptions.includes(form.hocVi) && (
                          <option value={form.hocVi}>{form.hocVi}</option>
                        )}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Năm kinh nghiệm</label>
                      <input type="number" min="0" className="form-control" value={form.namKinhNghiem} onChange={(e)=>setForm(f=>({...f, namKinhNghiem:e.target.value}))} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Giới tính</label>
                      <select className="form-select" value={form.gioiTinh} onChange={(e)=>setForm(f=>({...f, gioiTinh:e.target.value}))}>
                        <option value="nam">Nam</option>
                        <option value="nu">Nữ</option>
                        <option value="khac">Khác</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Ngày sinh</label>
                      <input type="date" className="form-control" value={form.ngaySinh} onChange={(e)=>setForm(f=>({...f, ngaySinh:e.target.value}))} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Số điện thoại</label>
                      <input className="form-control" value={form.soDienThoai} onChange={(e)=>setForm(f=>({...f, soDienThoai:e.target.value}))} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email (bác sĩ)</label>
                      <input type="email" className="form-control" value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Địa chỉ</label>
                      <input className="form-control" value={form.diaChi} onChange={(e)=>setForm(f=>({...f, diaChi:e.target.value}))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Ảnh đại diện (URL)</label>
                      <input className="form-control" value={form.anhDaiDien} onChange={(e)=>setForm(f=>({...f, anhDaiDien:e.target.value}))} />
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <label className="btn btn-sm btn-outline-secondary mb-0">
                          <i className="bi bi-upload"></i> Chọn ảnh từ file
                          <input type="file" accept="image/*" onChange={onUploadAvatar} hidden />
                        </label>
                        {form.anhDaiDien && (
                          <img src={toAbsoluteUrl(form.anhDaiDien)} alt="avatar" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%' }} />
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Mô tả</label>
                      <textarea className="form-control" rows={3} value={form.moTa} onChange={(e)=>setForm(f=>({...f, moTa:e.target.value}))}></textarea>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Trạng thái</label>
                      <select className="form-select" value={form.trangThai} onChange={(e)=>setForm(f=>({...f, trangThai:e.target.value}))}>
                        <option value="dang_cong_tac">Đang công tác</option>
                        <option value="tam_nghi">Tạm nghỉ</option>
                        <option value="da_nghi">Đã nghỉ</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowModal(false)}>Đóng</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{editing ? 'Lưu' : 'Thêm'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
