import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyResults(){
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(p=1){
    setLoading(true); setError('');
    try{
      const res = await fetch(`${API_URL}/api/booking/my-results?page=${p}&limit=10`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` } });
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
      <h3>Tra cứu kết quả cận lâm sàng</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead><tr><th>Ngày khám</th><th>Loại</th><th>Trạng thái</th><th>Bác sĩ chỉ định</th><th>Kết quả</th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id}>
                <td>{it.ngayKham ? new Date(it.ngayKham).toLocaleString() : '-'}</td>
                <td>{formatLoai(it.loaiChiDinh)}</td>
                <td>{formatTrangThai(it.trangThai)}</td>
                <td>{it.bacSi?.hoTen || '-'}</td>
                <td>{it.ketQua ? <ResultPreview ketQua={it.ketQua} /> : '-'}</td>
              </tr>
            ))}
            {items.length===0 && (
              <tr><td colSpan={5} className="text-center">Không có dữ liệu</td></tr>
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

function formatLoai(v){
  const map = { xet_nghiem: 'Xét nghiệm', sieu_am: 'Siêu âm', x_quang: 'X-Quang', ct: 'CT', mri: 'MRI', dien_tim: 'Điện tim', noi_soi: 'Nội soi' };
  return map[v] || v;
}
function formatTrangThai(v){
  const map = { cho_thuc_hien: 'Chờ thực hiện', dang_thuc_hien: 'Đang thực hiện', da_xong: 'Đã xong' };
  return map[v] || v;
}

function ResultPreview({ ketQua }){
  const [expanded, setExpanded] = useState(false);
  const isLong = (ketQua||'').length > 120;
  const text = expanded || !isLong ? ketQua : `${ketQua.slice(0,120)}...`;
  return (
    <div>
      <div style={{whiteSpace:'pre-wrap'}}>{text}</div>
      {isLong && (
        <button className="btn btn-link p-0" onClick={()=>setExpanded(!expanded)}>
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}
