import React, { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function Lookup(){
  const [q,setQ]=useState('');
  const [items,setItems]=useState([]);
  async function search(){
    const res = await fetch(`${API_URL}/api/doctor/patients?q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` }});
    const json = await res.json();
    if(res.ok) setItems(json.items||[]);
  }
  return (
    <div>
      <h3>Tra cứu thông tin bệnh nhân</h3>
      <div className="row g-2 mb-3">
        <div className="col-md-6"><input className="form-control" placeholder="Họ tên/SĐT" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') search(); }} /></div>
        <div className="col-md-2"><button className="btn btn-primary w-100" onClick={search}>Tìm</button></div>
      </div>
      <ul className="list-group">
        {items.map(p=> <li className="list-group-item" key={p._id}>{p.hoTen} - {p.soDienThoai||'-'}</li>)}
        {items.length===0 && <li className="list-group-item text-center">Không có dữ liệu</li>}
      </ul>
    </div>
  );
}
