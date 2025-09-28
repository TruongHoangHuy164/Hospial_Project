import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BookingHistory(){
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(p=1){
    setLoading(true); setError('');
    try{
      const res = await fetch(`${API_URL}/api/booking/my-appointments?page=${p}&limit=10`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` } });
      const json = await res.json();
      if(!res.ok) throw json;
      setItems(json.items||[]);
      setPage(json.page||1);
      setTotalPages(json.totalPages||1);
    }catch(e){ setError(e?.message||'Lỗi tải'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(1); },[]);

  return (
    <div className="container my-4">
      <h3>Lịch sử đặt khám</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead><tr><th>Ngày</th><th>Khung giờ</th><th>Bác sĩ</th><th>Chuyên khoa</th><th>Trạng thái</th><th>STT</th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it._id}>
                <td>{it.ngayKham? new Date(it.ngayKham).toLocaleDateString() : '-'}</td>
                <td>{it.khungGio || '-'}</td>
                <td>{it.bacSi?.hoTen || '-'}</td>
                <td>{it.chuyenKhoa?.ten || '-'}</td>
                <td>{it.trangThai}</td>
                <td>{it.soThuTu ?? '-'}</td>
              </tr>
            ))}
            {items.length===0 && (
              <tr><td colSpan={6} className="text-center">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <button disabled={loading || page<=1} className="btn btn-outline-secondary" onClick={()=>load(page-1)}>Trang trước</button>
        <span>Trang {page}/{totalPages}</span>
        <button disabled={loading || page>=totalPages} className="btn btn-outline-secondary" onClick={()=>load(page+1)}>Trang sau</button>
      </div>
    </div>
  );
}
