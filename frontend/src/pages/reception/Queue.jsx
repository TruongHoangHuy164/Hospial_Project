import React, { useEffect, useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function QueuePage(){
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10));
  const [bacSiId, setBacSiId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(){
    setLoading(true); setError('');
    try{
      const q = new URLSearchParams({ date, ...(bacSiId? { bacSiId } : {}) });
      const res = await fetch(`${API_URL}/api/booking/queues?${q.toString()}`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` } });
      const json = await res.json();
      if(!res.ok) throw json;
      setItems(json);
    }catch(e){ setError(e?.message||'Lỗi tải'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, []);

  return (
    <div>
      <h3>Danh sách số thứ tự</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-2 mb-3">
        <div className="col-md-3"><label className="form-label">Ngày</label><input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">Bác sĩ ID (tùy chọn)</label><input className="form-control" value={bacSiId} onChange={e=>setBacSiId(e.target.value)} /></div>
        <div className="col-md-2 align-self-end"><button className="btn btn-primary w-100" onClick={load} disabled={loading}>Tải</button></div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead><tr><th>STT</th><th>Họ tên</th><th>Giờ</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {items.map((it, idx)=> (
              <tr key={idx}>
                <td>{it.soThuTu ?? '-'}</td>
                <td>{it.benhNhan?.hoTen || '-'}</td>
                <td>{it.khungGio || '-'}</td>
                <td>{it.trangThai}</td>
                <td><button className="btn btn-sm btn-outline-secondary" onClick={()=>window.print()}><i className="bi bi-printer"></i> In</button></td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={5} className="text-center">Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
