import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ServicesPage(){
  const headers = useMemo(()=>({ 'Content-Type':'application/json' }), []);
  const [specialties, setSpecialties] = useState([]);
  const [selected, setSelected] = useState('');
  const [services, setServices] = useState([]);

  async function loadSpecialties(){
    const res = await fetch(`${API_URL}/api/public/specialties`, { headers });
    const j = await res.json();
    if(res.ok) setSpecialties(j.items || j);
  }
  async function loadServices(ckId){
    const url = new URL(`${API_URL}/api/public/services`);
    if(ckId) url.searchParams.set('chuyenKhoaId', ckId);
    const res = await fetch(url, { headers });
    const j = await res.json();
    if(res.ok) setServices(j);
  }

  useEffect(()=>{ loadSpecialties(); },[]);
  useEffect(()=>{ loadServices(selected); },[selected]);

  return (
    <div className="container py-4" style={{maxWidth: 1000}}>
      <h3 className="mb-3">Dịch vụ khám chữa bệnh</h3>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">Chuyên khoa</div>
            <div className="list-group list-group-flush">
              <button className={`list-group-item list-group-item-action ${selected===''?'active':''}`} onClick={()=>setSelected('')}>Tất cả</button>
              {specialties.map(s => (
                <button key={s._id} className={`list-group-item list-group-item-action ${selected===s._id?'active':''}`} onClick={()=>setSelected(s._id)}>{s.ten}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="row row-cols-1 row-cols-md-2 g-3">
            {services.map(s => (
              <div className="col" key={s._id}>
                <div className="card h-100">
                  <div className="card-body">
                    <div className="fw-semibold">{s.ten}</div>
                    {s.chuyenKhoaId?.ten && <div className="small text-muted">{s.chuyenKhoaId.ten}</div>}
                    <div className="mt-1 small">{s.moTa || '—'}</div>
                    {typeof s.gia === 'number' && s.gia >= 0 && (
                      <div className="mt-2"><span className="badge text-bg-light">Giá: {Number(s.gia).toLocaleString('vi-VN')} đ</span></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {services.length===0 && (
              <div className="col"><div className="text-muted">Chưa có dịch vụ</div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
