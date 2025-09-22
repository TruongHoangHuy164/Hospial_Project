import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DoctorProfile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  }), []);

  function toAbsoluteUrl(u){
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return `${API_URL}${u.startsWith('/')?u:'/'+u}`;
  }

  async function loadMe(){
    setLoading(true);
    try{
      const res = await fetch(`${API_URL}/api/doctor/me`, { headers });
      const json = await res.json();
      if(!res.ok) throw json;
      setMe(json);
    } catch(e){ alert(e?.message || 'Tải thông tin thất bại'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ loadMe(); },[]);

  async function onUploadAvatar(e){
    const file = e.target.files?.[0];
    if(!file) return;
    try{
      const headersNoJson = { Authorization: headers.Authorization };
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/api/uploads/image`, { method:'POST', headers: headersNoJson, body: fd });
      const json = await res.json();
      if(!res.ok) throw json;
      setMe(m=> ({...m, anhDaiDien: json.url }));
    }catch(err){ alert(err?.message || 'Upload ảnh thất bại'); }
    finally{ e.target.value = ''; }
  }

  async function save(){
    setSaving(true);
    try{
      const payload = {
        hoTen: me.hoTen,
        email: me.email,
        soDienThoai: me.soDienThoai,
        diaChi: me.diaChi,
        moTa: me.moTa,
        anhDaiDien: me.anhDaiDien,
        ngaySinh: me.ngaySinh,
        gioiTinh: me.gioiTinh,
      };
      const res = await fetch(`${API_URL}/api/doctor/me`, { method:'PUT', headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if(!res.ok) throw json;
      setMe(json);
      alert('Đã lưu');
    }catch(e){ alert(e?.message || 'Lưu thất bại'); }
    finally{ setSaving(false); }
  }

  if(loading || !me) return <div className="container py-4">Đang tải...</div>;

  return (
    <div className="container py-2">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3 text-center">
              {me.anhDaiDien ? (
                <img src={toAbsoluteUrl(me.anhDaiDien)} alt="avatar" style={{width:140,height:140,objectFit:'cover',borderRadius:'50%'}} />
              ) : (
                <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{width:140,height:140}}>
                  <i className="bi bi-person fs-1 text-secondary"/>
                </div>
              )}
              <div className="mt-2">
                <label className="btn btn-sm btn-outline-secondary mb-0">
                  <i className="bi bi-upload"></i> Đổi ảnh
                  <input type="file" accept="image/*" onChange={onUploadAvatar} hidden />
                </label>
              </div>
            </div>
            <div className="col-md-9">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Họ tên</label>
                  <input className="form-control" value={me.hoTen||''} onChange={(e)=>setMe(m=>({...m, hoTen:e.target.value}))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={me.email||''} onChange={(e)=>setMe(m=>({...m, email:e.target.value}))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-control" value={me.soDienThoai||''} onChange={(e)=>setMe(m=>({...m, soDienThoai:e.target.value}))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-control" value={me.ngaySinh? String(me.ngaySinh).slice(0,10):''} onChange={(e)=>setMe(m=>({...m, ngaySinh:e.target.value}))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Giới tính</label>
                  <select className="form-select" value={me.gioiTinh||'khac'} onChange={(e)=>setMe(m=>({...m, gioiTinh:e.target.value}))}>
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Địa chỉ</label>
                  <input className="form-control" value={me.diaChi||''} onChange={(e)=>setMe(m=>({...m, diaChi:e.target.value}))} />
                </div>
                <div className="col-12">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={3} value={me.moTa||''} onChange={(e)=>setMe(m=>({...m, moTa:e.target.value}))}></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end gap-2">
          <button className="btn btn-primary" disabled={saving} onClick={save}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
