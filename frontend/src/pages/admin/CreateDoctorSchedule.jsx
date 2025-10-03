import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CreateDoctorSchedule() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load doctors list
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Load doctors error:', err);
    }
  };

  const createSchedule = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !startDate || !endDate) {
      setMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/booking/create-doctor-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          bacSiId: selectedDoctor,
          startDate,
          endDate
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // Reset form
        setSelectedDoctor('');
        setStartDate('');
        setEndDate('');
      } else {
        setMessage(`❌ ${data.message || 'Lỗi tạo lịch'}`);
      }
    } catch (err) {
      console.error('Create schedule error:', err);
      setMessage('❌ Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Tạo lịch làm việc cho bác sĩ</h4>
            </div>
            <div className="card-body">
              <form onSubmit={createSchedule}>
                <div className="mb-3">
                  <label className="form-label">Chọn bác sĩ *</label>
                  <select
                    className="form-select"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.hoTen} - {doctor.chuyenKhoa?.ten || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Từ ngày *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Đến ngày *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="alert alert-info">
                  <h6>Quy tắc tạo lịch:</h6>
                  <ul className="mb-0">
                    <li><strong>Thứ 2 - Thứ 6:</strong> Ca sáng (8h-12h) + Ca chiều (14h-17h)</li>
                    <li><strong>Thứ 7:</strong> Chỉ ca sáng (8h-12h)</li>
                    <li><strong>Chủ nhật:</strong> Nghỉ</li>
                  </ul>
                </div>

                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Đang tạo...' : 'Tạo lịch làm việc'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}