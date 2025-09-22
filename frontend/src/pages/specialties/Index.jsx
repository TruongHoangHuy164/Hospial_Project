import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const icons = [
  'clipboard2-pulse','person-hearts','ear','lungs','liver','person','bone','capsule','heart-pulse','activity','droplet','brain'
];

export default function SpecialtiesPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    try{
      const res = await fetch(`${API_URL}/api/booking/specialties`);
      const json = await res.json();
      if(!res.ok) throw json;
      setItems(json);
    }catch(e){ console.error(e); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <section className="section container">
      <div className="section__head">
        <h2>Chuyên khoa</h2>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="row g-3">
          {items.map((s, idx) => (
            <div key={s._id} className="col-md-6">
              <div className="d-flex align-items-center p-3 rounded-3" style={{ background:'#1e1f22' }}>
                <div className="me-3 d-flex align-items-center justify-content-center rounded-2" style={{ width:64, height:64, background:'linear-gradient(135deg,#1b76ff,#1e9bff)' }}>
                  <i className={`bi bi-${icons[idx % icons.length]} fs-3 text-dark`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="text-uppercase fw-semibold" style={{ color:'#6ec1ff' }}>{s.ten}</div>
                  <div className="small opacity-75">Xem chi tiết</div>
                </div>
                <Link className="btn btn-outline-primary btn-sm" to={`/booking?chuyenKhoaId=${s._id}`}>Đặt lịch</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
