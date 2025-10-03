import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminServicesPage(){
  const { user } = useAuth();
  const headers = useMemo(()=>({ 'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` }), []);

  const [tab, setTab] = useState('services');

  // Services state
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ ten:'', moTa:'', gia: 0, active:true, chuyenKhoaId:'' });
  const [editingId, setEditingId] = useState(null);

  // Specialties and matrix state
  const [specialties, setSpecialties] = useState([]);
  const [filterChuyenKhoaId, setFilterChuyenKhoaId] = useState('');

  async function loadServices(){
    const url = new URL(`${API_URL}/api/services`);
    if(filterChuyenKhoaId) url.searchParams.set('chuyenKhoaId', filterChuyenKhoaId);
    const res = await fetch(url, { headers });
    const json = await res.json();
    if(res.ok) setServices(json);
  }
  async function loadSpecialties(){
    const res = await fetch(`${API_URL}/api/specialties`, { headers });
    const j = await res.json();
    if(res.ok) setSpecialties(j.items || j); // route returns items for admin list API
  }
  // pricing tab and related logic removed

  useEffect(()=>{ loadServices(); },[filterChuyenKhoaId]);
  useEffect(()=>{ loadSpecialties(); },[]);
  // matrix removed

  // Service CRUD
  async function saveService(){
    try{
      if(!form.chuyenKhoaId){ toast.error('Vui lòng chọn chuyên khoa'); return; }
      const giaNumber = Number(form.gia || 0);
      if(isNaN(giaNumber) || giaNumber < 0){ toast.error('Giá không hợp lệ'); return; }
      const payload = { ...form, gia: giaNumber };
      let serviceId = editingId;
      if(editingId){
        const res = await fetch(`${API_URL}/api/services/${editingId}`, { method:'PUT', headers, body: JSON.stringify(payload) });
        if(!res.ok) throw await res.json();
        toast.success('Đã cập nhật dịch vụ');
        serviceId = editingId;
      }else{
        const res = await fetch(`${API_URL}/api/services`, { method:'POST', headers, body: JSON.stringify(payload) });
        if(!res.ok) throw await res.json();
        toast.success('Đã tạo dịch vụ');
      }
      setForm({ ten:'', moTa:'', gia: 0, active:true, chuyenKhoaId: filterChuyenKhoaId || (specialties[0]?._id || '') });
      setEditingId(null);
      await loadServices();
    }catch(e){ toast.error(e?.message || 'Lỗi lưu dịch vụ'); }
  }
  async function editService(s){
    const ckId = (s.chuyenKhoaId?._id || s.chuyenKhoaId || '');
    setForm({ ten:s.ten, moTa:s.moTa||'', gia: Number(s.gia || 0), active:!!s.active, chuyenKhoaId: ckId });
    setEditingId(s._id);
  }
  async function deleteService(id){ if(!confirm('Xóa dịch vụ?')) return; const res = await fetch(`${API_URL}/api/services/${id}`, { method:'DELETE', headers }); if(res.ok){ toast.success('Đã xóa'); loadServices(); } else toast.error('Lỗi xóa'); }

  // matrix editing removed

  return (
    <div>
      <h3>Quản lý dịch vụ</h3>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab==='services'?'active':''}`} onClick={()=>setTab('services')}>Dịch vụ</button></li>
      </ul>

      {tab==='services' && (
        <div className="row g-3">
          <div className="col-md-5">
            <div className="card">
              <div className="card-header">{editingId? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</div>
              <div className="card-body">
                <div className="mb-2">
                  <label className="form-label">Chuyên khoa</label>
                  <select className="form-select" value={form.chuyenKhoaId} onChange={e=>setForm({...form, chuyenKhoaId:e.target.value})}>
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map(s => <option key={s._id} value={s._id}>{s.ten}</option>)}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Tên</label>
                  <input className="form-control" value={form.ten} onChange={e=>setForm({...form, ten:e.target.value})} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" value={form.moTa} onChange={e=>setForm({...form, moTa:e.target.value})} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Giá (VND)</label>
                  <input type="number" min="0" step="1000" className="form-control" value={form.gia} onChange={e=>setForm({...form, gia:e.target.value})} />
                  {Number(form.gia) > 0 && (
                    <div className="mt-2 d-flex align-items-center flex-wrap gap-2">
                      <span className="small text-muted me-1">Gợi ý:</span>
                      {([10,100,1000]).map(mult => {
                        const val = Number(form.gia) * mult;
                        const label = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
                        return (
                          <button
                            key={mult}
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={()=>setForm({ ...form, gia: val })}
                            title={`Nhân ${mult}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="form-check mb-3">
                  <input id="active" type="checkbox" className="form-check-input" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} />
                  <label className="form-check-label" htmlFor="active">Kích hoạt</label>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" onClick={saveService}>{editingId? 'Cập nhật' : 'Thêm mới'}</button>
                  {editingId && <button className="btn btn-outline-secondary" onClick={()=>{ setEditingId(null); setForm({ ten:'', moTa:'', gia: 0, active:true, chuyenKhoaId: filterChuyenKhoaId || (specialties[0]?._id || '') }); }}>Hủy</button>}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-7">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <span>Danh sách dịch vụ</span>
                <div className="d-flex align-items-center gap-2">
                  <label className="small text-muted">Lọc theo chuyên khoa:</label>
                  <select className="form-select form-select-sm" style={{minWidth:220}} value={filterChuyenKhoaId} onChange={e=>setFilterChuyenKhoaId(e.target.value)}>
                    <option value="">Tất cả</option>
                    {specialties.map(s => <option key={s._id} value={s._id}>{s.ten}</option>)}
                  </select>
                </div>
              </div>
              <div className="list-group list-group-flush">
                {services.map(s => (
                  <div key={s._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{s.ten}</div>
                      <div className="small text-muted">{s.moTa}</div>
                      {s.chuyenKhoaId && <div className="small mb-1"><span className="badge text-bg-light">{s.chuyenKhoaId.ten || s.chuyenKhoaId}</span></div>}
                      <div className="small mb-1"><span className="badge text-bg-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(s.gia || 0))}</span></div>
                      {/* Giá hiển thị theo chuyên khoa đã loại bỏ */}
                      {!s.active && <span className="badge text-bg-secondary">Đã tắt</span>}
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-primary" onClick={()=>editService(s)}>Sửa</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteService(s._id)}>Xóa</button>
                    </div>
                  </div>
                ))}
                {services.length===0 && <div className="list-group-item text-center text-muted">Chưa có dịch vụ</div>}
              </div>
            </div>
          </div>
        </div>
      )}

  {/* Tab bảng giá đã loại bỏ theo yêu cầu */}
    </div>
  );
}
