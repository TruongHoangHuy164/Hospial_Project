import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Clinics() {
  const [tab, setTab] = useState('clinics'); // 'clinics' | 'specialties'
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ tenPhong: '', chuyenKhoa: '', chuyenKhoaId: '' });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [specQ, setSpecQ] = useState('');
  const [specForm, setSpecForm] = useState({ ten: '', moTa: '' });
  const [specEditing, setSpecEditing] = useState(null);
  const [showSpecModal, setShowSpecModal] = useState(false);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  }), []);

  async function load() {
    setLoading(true); setError('');
    try {
      const url = new URL(`${API_URL}/api/clinics`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(limit));
      if (q) url.searchParams.set('q', q);
      if (specEditing === null && specQ === '' && specSelectedId()) {
        url.searchParams.set('chuyenKhoaId', specSelectedId());
      }
      const res = await fetch(url, { headers });
      const json = await res.json();
      if (!res.ok) throw json;
      setItems(json.items || []);
      setTotalPages(json.totalPages || 1);
    } catch (e) { setError(e?.message || 'Lỗi tải danh sách'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, limit]);
  useEffect(() => { if (tab === 'clinics') load(); /* eslint-disable-next-line */ }, [q]);

  async function loadSpecialties() {
    try {
      const url = new URL(`${API_URL}/api/specialties`);
      url.searchParams.set('limit', '200');
      if (specQ) url.searchParams.set('q', specQ);
      const res = await fetch(url, { headers });
      const json = await res.json();
      if (!res.ok) throw json;
      setSpecialties(json.items || []);
    } catch (e) {}
  }
  useEffect(() => { loadSpecialties(); /* eslint-disable-next-line */ }, [specQ]);

  function specSelectedId() {
    // if editing a clinic, prefer its selected id; else none
    return form?.chuyenKhoaId || '';
  }

  function openCreate() {
    setEditing(null);
    setForm({ tenPhong: '', chuyenKhoa: '', chuyenKhoaId: '' });
    setShowModal(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ tenPhong: c.tenPhong || '', chuyenKhoa: c.chuyenKhoa || '', chuyenKhoaId: (c.chuyenKhoaId?._id || c.chuyenKhoaId || '') });
    setShowModal(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${API_URL}/api/clinics/${editing._id}` : `${API_URL}/api/clinics`;
      const payload = { ...form };
      if (!payload.chuyenKhoaId) {
        alert('Vui lòng chọn chuyên khoa');
        return;
      }
      const spec = specialties.find(s => s._id === payload.chuyenKhoaId);
      payload.chuyenKhoa = spec ? spec.ten : '';
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw json;
      setShowModal(false);
      await load();
    } catch (e) { alert(e?.message || 'Lưu thất bại'); }
  }

  async function removeClinic(id) {
    if (!confirm('Xóa phòng khám này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/clinics/${id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!res.ok) throw json;
      await load();
    } catch (e) { alert(e?.message || 'Xóa thất bại'); }
  }

  return (
    <div>
      <h3 className="mb-3">Quản lý chuyên khoa & phòng khám</h3>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab==='clinics'?'active':''}`} onClick={()=>setTab('clinics')}>Phòng khám</button></li>
        <li className="nav-item"><button className={`nav-link ${tab==='specialties'?'active':''}`} onClick={()=>setTab('specialties')}>Chuyên khoa</button></li>
      </ul>
      {error && <div className="alert alert-danger">{error}</div>}
      {tab === 'clinics' && (
      <div className="row g-3 mb-3">
        <div className="col-md-5 d-flex gap-2">
          <button className="btn btn-success" onClick={openCreate}><i className="bi bi-plus-circle"></i> Thêm phòng khám</button>
        </div>
        <div className="col-md-7 d-flex gap-2">
          <input className="form-control" placeholder="Tìm theo tên/chuyên khoa" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ setPage(1); load(); } }} />
          <button className="btn btn-primary" onClick={()=>{ setPage(1); load(); }} disabled={loading}><i className="bi bi-search"></i> Tìm</button>
          <select className="form-select" value={limit} onChange={(e)=>{ setLimit(parseInt(e.target.value,10)); setPage(1); }} style={{ maxWidth: 140 }}>
            {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/trang</option>)}
          </select>
        </div>
      </div>
      )}

      {tab === 'clinics' && (
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Tên phòng</th>
              <th>Chuyên khoa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c._id}>
                <td>{c.tenPhong}</td>
                <td>{c.chuyenKhoaId?.ten || c.chuyenKhoa}</td>
                <td className="text-end d-flex gap-2 justify-content-end">
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>openEdit(c)}>Sửa</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>removeClinic(c._id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3} className="text-center">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {tab === 'clinics' && (
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div>Trang {page}/{totalPages}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Trước</button>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Sau</button>
        </div>
      </div>
      )}

      {showModal && tab === 'clinics' && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Cập nhật phòng khám' : 'Thêm phòng khám'}</h5>
                <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
              </div>
              <form onSubmit={submitForm}>
                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label">Tên phòng</label>
                      <input className="form-control" value={form.tenPhong} onChange={(e)=>setForm(f=>({...f, tenPhong:e.target.value}))} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Chuyên khoa</label>
                      <select className="form-select" value={form.chuyenKhoaId} onChange={(e)=>setForm(f=>({...f, chuyenKhoaId:e.target.value}))} required>
                        <option value="">-- Chọn chuyên khoa --</option>
                        {specialties.map(s=> <option key={s._id} value={s._id}>{s.ten}</option>)}
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

      {tab === 'specialties' && (
        <div>
          <div className="row g-3 mb-3">
            <div className="col-md-5 d-flex gap-2">
              <button className="btn btn-success" onClick={()=>{ setSpecEditing(null); setSpecForm({ ten: '', moTa: '' }); setShowSpecModal(true); }}><i className="bi bi-plus-circle"></i> Thêm chuyên khoa</button>
            </div>
            <div className="col-md-7 d-flex gap-2">
              <input className="form-control" placeholder="Tìm theo tên chuyên khoa" value={specQ} onChange={(e)=>setSpecQ(e.target.value)} />
              <button className="btn btn-primary" onClick={()=>loadSpecialties()} disabled={loading}><i className="bi bi-search"></i> Tìm</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {specialties.map(s => (
                  <tr key={s._id}>
                    <td>{s.ten}</td>
                    <td>{s.moTa || '-'}</td>
                    <td className="text-end d-flex gap-2 justify-content-end">
                      <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setSpecEditing(s); setSpecForm({ ten: s.ten || '', moTa: s.moTa || '' }); setShowSpecModal(true); }}>Sửa</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={async ()=>{ if (!confirm('Xóa chuyên khoa này?')) return; try { const res = await fetch(`${API_URL}/api/specialties/${s._id}`, { method: 'DELETE', headers }); const json = await res.json(); if (!res.ok) throw json; loadSpecialties(); } catch (e) { alert(e?.message || 'Xóa thất bại'); } }}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {specialties.length === 0 && (
                  <tr><td colSpan={3} className="text-center">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSpecModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{specEditing ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa'}</h5>
                <button type="button" className="btn-close" onClick={()=>setShowSpecModal(false)}></button>
              </div>
              <form onSubmit={async (e)=>{ e.preventDefault(); try { const method = specEditing ? 'PUT' : 'POST'; const url = specEditing ? `${API_URL}/api/specialties/${specEditing._id}` : `${API_URL}/api/specialties`; const res = await fetch(url, { method, headers, body: JSON.stringify(specForm) }); const json = await res.json(); if (!res.ok) throw json; setShowSpecModal(false); await loadSpecialties(); } catch (e2) { alert(e2?.message || 'Lưu thất bại'); } }}>
                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label">Tên chuyên khoa</label>
                      <input className="form-control" value={specForm.ten} onChange={(e)=>setSpecForm(f=>({...f, ten:e.target.value}))} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Mô tả</label>
                      <textarea className="form-control" rows={3} value={specForm.moTa} onChange={(e)=>setSpecForm(f=>({...f, moTa:e.target.value}))}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowSpecModal(false)}>Đóng</button>
                  <button type="submit" className="btn btn-primary">{specEditing ? 'Lưu' : 'Thêm'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
