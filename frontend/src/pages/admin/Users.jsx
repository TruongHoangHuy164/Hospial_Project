import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Users() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  }), []);

  async function load() {
    setLoading(true); setError('');
    try {
      const url = new URL(`${API_URL}/api/users`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(limit));
      if (q) url.searchParams.set('q', q);
      if (roleFilter) url.searchParams.set('role', roleFilter);
      const res = await fetch(url, { headers });
      const json = await res.json();
      if (!res.ok) throw json;
      setItems(json.items || []);
      setTotalPages(json.totalPages || 1);
    } catch (e) {
      setError(e?.message || 'Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, limit, roleFilter]);

  async function updateRole(id, role) {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/role`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) throw json;
      // Refresh list
      await load();
    } catch (e) {
      alert(e?.message || 'Cập nhật vai trò thất bại');
    }
  }

  return (
    <div>
      <h3 className="mb-3">Quản lý người dùng</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-2 mb-3">
        <div className="col-sm-6 col-md-4">
          <input className="form-control" placeholder="Tìm theo tên/email" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { setPage(1); load(); } }} />
        </div>
        <div className="col-sm-3 col-md-2">
          <select className="form-select" value={roleFilter} onChange={(e)=>{ setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả vai trò</option>
            <option value="user">User</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-sm-3 col-md-2">
          <button className="btn btn-primary w-100" onClick={()=>{ setPage(1); load(); }} disabled={loading}><i className="bi bi-search"></i> Tìm</button>
        </div>
        <div className="col-sm-3 col-md-2 ms-auto">
          <select className="form-select" value={limit} onChange={(e)=>{ setLimit(parseInt(e.target.value,10)); setPage(1); }}>
            {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/trang</option>)}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select className="form-select form-select-sm" value={u.role} onChange={(e)=>updateRole(u._id, e.target.value)}>
                    <option value="user">User</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                <td></td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <div>Trang {page}/{totalPages}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Trước</button>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Sau</button>
        </div>
      </div>
    </div>
  );
}
