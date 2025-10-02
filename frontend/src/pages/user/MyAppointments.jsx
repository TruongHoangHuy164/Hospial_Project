import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AppointmentStatus = ({ status }) => {
  const statusMap = {
    pending_payment: { text: 'Chờ thanh toán', color: 'warning' },
    confirmed: { text: 'Đã xác nhận', color: 'primary' },
    completed: { text: 'Đã hoàn thành', color: 'success' },
    cancelled: { text: 'Đã hủy', color: 'danger' },
    checked_in: { text: 'Đã check-in', color: 'info' },
  };
  const { text, color } = statusMap[status] || { text: status, color: 'secondary' };
  return <span className={`badge text-bg-${color}`}>{text}</span>;
};

export default function MyAppointments() {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  }), []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/booking/my-appointments`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        toast.error(error.message || 'Không thể tải lịch khám.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, headers]);

  return (
    <div className="container py-4">
      <h3 className="mb-4">Lịch khám của tôi</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : appointments.length === 0 ? (
        <p>Bạn chưa có lịch khám nào.</p>
      ) : (
        <div className="list-group">
          {appointments.map((appt) => (
            <div key={appt._id} className="list-group-item list-group-item-action flex-column align-items-start">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">
                  Lịch khám ngày {new Date(appt.ngayKham).toLocaleDateString('vi-VN')}
                </h5>
                <small><AppointmentStatus status={appt.trangThai} /></small>
              </div>
              <p className="mb-1">
                <strong>Bệnh nhân:</strong> {appt.hoSoBenhNhan?.hoTen || appt.benhNhan?.hoTen}
                <br />
                <strong>Bác sĩ:</strong> {appt.bacSi?.hoTen} - <strong>Chuyên khoa:</strong> {appt.chuyenKhoa?.ten}
                <br />
                <strong>Giờ khám:</strong> {appt.khungGio}
              </p>
              {appt.soThuTu && (
                 <p className="mb-0">
                    <strong>Số thứ tự:</strong> <span className="fw-bold fs-5">{appt.soThuTu.so}</span>
                 </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
