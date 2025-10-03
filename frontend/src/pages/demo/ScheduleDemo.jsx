import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ScheduleDemo() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctor(data.doctors[0]._id);
        }
      }
    } catch (err) {
      console.error('Load doctors error:', err);
    }
  };

  const loadScheduleInfo = async () => {
    if (!selectedDoctor || !selectedDate) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/booking/available-slots?date=${selectedDate}&bacSiId=${selectedDoctor}`);
      if (res.ok) {
        const data = await res.json();
        setScheduleInfo(data);
      } else {
        setScheduleInfo(null);
      }
    } catch (err) {
      console.error('Load schedule error:', err);
      setScheduleInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadScheduleInfo();
    }
  }, [selectedDoctor, selectedDate]);

  const formatShiftName = (ca) => {
    switch(ca) {
      case 'sang': return '🌅 Ca sáng (8h-12h)';
      case 'chieu': return '☀️ Ca chiều (14h-17h)';
      case 'toi': return '🌙 Ca tối (17h-20h)';
      default: return ca;
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">🕐 Demo Logic Khung Giờ Bác Sĩ</h4>
              <small className="text-muted">Xem các khung giờ cụ thể còn trống trong ngày</small>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Chọn bác sĩ:</label>
                  <select
                    className="form-select"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.hoTen} - {doctor.chuyenKhoa?.ten || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Chọn ngày:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {loading && (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              )}

              {scheduleInfo && !loading && (
                <div className="row">
                  <div className="col-md-12">
                    <h5>📅 Thông tin lịch làm việc ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h5>
                    
                    {/* Working Shifts */}
                    {scheduleInfo.doctorSchedules && scheduleInfo.doctorSchedules.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-title">🏥 Ca làm việc hôm nay:</h6>
                          {scheduleInfo.doctorSchedules.map((schedule, index) => (
                            <span key={index} className="badge bg-primary me-2 mb-1 p-2">
                              {formatShiftName(schedule.ca)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Working Time Slots */}
                    {scheduleInfo.doctorWorkingSlots && scheduleInfo.doctorWorkingSlots.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-title">⏰ Tất cả khung giờ làm việc ({scheduleInfo.doctorWorkingSlots.length} khung):</h6>
                          <div>
                            {scheduleInfo.doctorWorkingSlots.map(slot => (
                              <span key={slot} className="badge bg-info me-1 mb-1 p-2">{slot}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Booked Slots */}
                    {scheduleInfo.bookedSlots && scheduleInfo.bookedSlots.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-title">❌ Khung giờ đã được đặt ({scheduleInfo.bookedSlots.length} khung):</h6>
                          <div>
                            {scheduleInfo.bookedSlots.map(slot => (
                              <span key={slot} className="badge bg-danger me-1 mb-1 p-2">{slot}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Available Slots */}
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">
                          ✅ Khung giờ còn trống ({scheduleInfo.availableSlots?.length || 0} khung):
                        </h6>
                        {scheduleInfo.availableSlots && scheduleInfo.availableSlots.length > 0 ? (
                          <div>
                            {scheduleInfo.availableSlots.map(slot => (
                              <span key={slot} className="badge bg-success me-1 mb-1 p-2" style={{fontSize: '14px'}}>
                                {slot}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="alert alert-warning mb-0">
                            <strong>Không có khung giờ trống trong ngày này!</strong>
                            <br />
                            <small>Bác sĩ có thể đã được đặt hết lịch hoặc không làm việc hôm này.</small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logic Explanation */}
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">💡 Giải thích logic:</h6>
                        <ol className="mb-0">
                          <li><strong>Khung giờ làm việc</strong> = Tất cả slots trong các ca mà bác sĩ làm việc</li>
                          <li><strong>Khung giờ đã đặt</strong> = Các slots đã có người đặt lịch</li>
                          <li><strong>Khung giờ còn trống</strong> = Khung giờ làm việc - Khung giờ đã đặt</li>
                          <li>User chỉ có thể chọn từ <strong>khung giờ còn trống</strong> để đặt/đổi lịch</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!scheduleInfo && !loading && selectedDoctor && selectedDate && (
                <div className="alert alert-warning">
                  <strong>Không thể tải thông tin lịch làm việc!</strong>
                  <br />
                  Có thể bác sĩ chưa có lịch làm việc cho ngày này hoặc server chưa khởi động.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}