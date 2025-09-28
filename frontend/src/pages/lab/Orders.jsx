import React, { useEffect, useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LabOrders(){
  const [status, setStatus] = useState('cho_thuc_hien');
  const [items,setItems]=useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultDraft, setResultDraft] = useState({});

  async function load(){
    setLoading(true); setError('');
    try{
      const q = new URLSearchParams({ status });
      const res = await fetch(`${API_URL}/api/lab/orders?${q.toString()}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')||''}` }});
      const json = await res.json();
      if(!res.ok) throw json;
      setItems(json);
    }catch(e){ setError(e?.message||'Lỗi tải'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [status]);

  async function start(id){
    const res = await fetch(`${API_URL}/api/lab/orders/${id}/start`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')||''}` }});
    if(res.ok) load();
  }
  async function complete(id){
    const body = { ketQua: resultDraft[id] || '' };
    const res = await fetch(`${API_URL}/api/lab/orders/${id}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')||''}` }, body: JSON.stringify(body) });
    if(res.ok) { setResultDraft(prev=> ({ ...prev, [id]: '' })); load(); }
  }

  return (
    <div>
      <h3>Chỉ định cận lâm sàng</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <label className="form-label">Trạng thái</label>
          <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="cho_thuc_hien">Chờ thực hiện</option>
            <option value="dang_thuc_hien">Đang thực hiện</option>
            <option value="da_xong">Đã xong</option>
          </select>
        </div>
        <div className="col-md-2 align-self-end"><button className="btn btn-primary w-100" disabled={loading} onClick={load}>Tải</button></div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead><tr><th>BN</th><th>Loại</th><th>Trạng thái</th><th>Kết quả</th><th>Hành động</th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it._id}>
                <td>{it.hoSoKhamId?.benhNhanId?.hoTen||'-'}</td>
                <td>{it.loaiChiDinh}</td>
                <td>{it.trangThai}</td>
                <td style={{minWidth: 240}}>
                  <input className="form-control form-control-sm" placeholder="Nhập kết quả" value={resultDraft[it._id]||it.ketQua||''} onChange={e=> setResultDraft(prev=> ({ ...prev, [it._id]: e.target.value }))} />
                </td>
                <td className="text-nowrap">
                  {it.trangThai==='cho_thuc_hien' && <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>start(it._id)}>Bắt đầu</button>}
                  {(it.trangThai==='cho_thuc_hien' || it.trangThai==='dang_thuc_hien') && <button className="btn btn-sm btn-success" onClick={()=>complete(it._id)}>Hoàn tất</button>}
                </td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={5} className="text-center">Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
