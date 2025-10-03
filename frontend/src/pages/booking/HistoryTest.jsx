import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function HistoryTest() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function testAPI() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token:', token ? 'exists' : 'missing');
      
      const res = await fetch(`${API_URL}/api/booking/my-appointments?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      
      console.log('Response status:', res.status);
      const json = await res.json();
      console.log('Response data:', json);
      
      if (!res.ok) throw json;
      
      setItems(json.items || []);
    } catch (e) {
      console.error('Error:', e);
      setError(e?.message || 'Lỗi tải');
    } finally {
      setLoading(false);
    }
  }

  async function testCancel(id) {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/booking/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      
      console.log('Cancel response status:', res.status);
      const json = await res.json();
      console.log('Cancel response data:', json);
      
      if (res.ok) {
        alert('Hủy thành công!');
        testAPI(); // Reload
      } else {
        alert(json.message || 'Lỗi hủy');
      }
    } catch (e) {
      console.error('Cancel error:', e);
      alert('Lỗi hủy: ' + e.message);
    }
  }

  async function testReschedule(id) {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/booking/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          date: '2025-10-10',
          khungGio: '10:00-11:00'
        })
      });
      
      console.log('Reschedule response status:', res.status);
      const json = await res.json();
      console.log('Reschedule response data:', json);
      
      if (res.ok) {
        alert('Đổi lịch thành công!');
        testAPI(); // Reload
      } else {
        alert(json.message || 'Lỗi đổi lịch');
      }
    } catch (e) {
      console.error('Reschedule error:', e);
      alert('Lỗi đổi lịch: ' + e.message);
    }
  }

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="container my-4">
      <h3>Test History API</h3>
      
      <button className="btn btn-primary me-2" onClick={testAPI} disabled={loading}>
        {loading ? 'Loading...' : 'Reload Data'}
      </button>
      
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      
      <div className="mt-3">
        <h5>Data ({items.length} items):</h5>
        {items.map(item => (
          <div key={item._id} className="card mb-2">
            <div className="card-body">
              <h6 className="card-title">{item.benhNhan?.hoTen || 'N/A'}</h6>
              <p className="card-text">
                <strong>Ngày:</strong> {new Date(item.ngayKham).toLocaleDateString()} <br/>
                <strong>Giờ:</strong> {item.khungGio} <br/>
                <strong>Trạng thái:</strong> {item.trangThai} <br/>
                <strong>Bác sĩ:</strong> {item.bacSi?.hoTen || 'N/A'}
              </p>
              
              <div className="btn-group">
                <button 
                  className="btn btn-sm btn-warning" 
                  onClick={() => testReschedule(item._id)}
                >
                  Test Reschedule
                </button>
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => testCancel(item._id)}
                >
                  Test Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}