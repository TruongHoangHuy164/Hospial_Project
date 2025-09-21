import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Overview() {
  const [data, setData] = useState({ usersCount: 0, patientsCount: 0, latestPatients: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/admin/overview`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` },
        });
        const json = await res.json();
        if (!res.ok) throw json;
        if (mounted) setData(json);
      } catch (e) {
        setError(e?.message || 'Lỗi tải dữ liệu');
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container-fluid">
      <h3 className="mb-4">Bảng điều khiển</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Người dùng</h6>
                  <h3 className="mb-0">{data.usersCount}</h3>
                </div>
                <i className="bi bi-people fs-1 text-primary"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Bệnh nhân</h6>
                  <h3 className="mb-0">{data.patientsCount}</h3>
                </div>
                <i className="bi bi-clipboard2-pulse fs-1 text-success"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Tỉ lệ giường (demo)</h6>
                  <div className="progress" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar" style={{ width: '62%' }}>62%</div>
                  </div>
                </div>
                <i className="bi bi-hospital fs-1 text-info"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <strong>Bệnh nhân mới nhất</strong>
        </div>
        <div className="table-responsive">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {data.latestPatients.map((p) => (
                <tr key={p._id}>
                  <td>{p.fullName}</td>
                  <td>{p.gender || '-'}</td>
                  <td>{p.dob ? new Date(p.dob).toLocaleDateString() : '-'}</td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {data.latestPatients.length === 0 && (
                <tr><td colSpan={4} className="text-center">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
