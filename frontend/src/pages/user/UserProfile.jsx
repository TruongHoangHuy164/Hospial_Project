import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Create headers manually since AuthContext doesn't provide them
  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug profile state changes
  useEffect(() => {
    console.log('Profile state changed:', profile);
  }, [profile]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const headers = getHeaders();
      console.log('Loading profile with headers:', headers);
      console.log('API_URL:', API_URL);
      
      const response = await fetch(`${API_URL}/api/users/profile`, { headers: getHeaders() });
      console.log('Profile response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile API error:', response.status, errorText);
        throw new Error(`Không thể tải thông tin profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Profile data received:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin cá nhân - Backend có thể chưa chạy');
      
      // Try to load from localStorage first
      let fallbackProfile;
      try {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          fallbackProfile = JSON.parse(savedProfile);
          console.log('Loaded profile from localStorage:', fallbackProfile);
          toast.info('Hiển thị thông tin đã lưu local');
        }
      } catch (e) {
        console.log('No saved profile in localStorage');
      }
      
      // If no saved profile, use default
      if (!fallbackProfile) {
        fallbackProfile = {
          email: user?.email || 'demo@example.com',
          role: user?.role || 'user', 
          createdAt: new Date().toISOString(),
          hoTen: user?.name || 'Demo User',
          ngaySinh: '',
          gioiTinh: 'khac',
          diaChi: '',
          soDienThoai: '',
          maBHYT: ''
        };
      }
      
      console.log('Setting fallback profile:', fallbackProfile);
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2">Đang tải thông tin...</p>
              <div className="mt-3">
                <p className="text-muted">API URL: {API_URL}</p>
                <p className="text-muted">Headers: {JSON.stringify(getHeaders())}</p>
                <p className="text-muted">Authenticated: {String(isAuthenticated)}</p>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    console.log('Manual test API call');
                    fetch(`${API_URL}/api/users/profile`, { headers })
                      .then(r => {
                        console.log('Manual test response:', r.status);
                        return r.json();
                      })
                      .then(data => console.log('Manual test data:', data))
                      .catch(err => console.error('Manual test error:', err));
                  }}
                >
                  Test API Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-warning">
              <h4 className="alert-heading">Không thể tải thông tin</h4>
              <p>Có lỗi xảy ra khi tải thông tin cá nhân của bạn.</p>
              <div className="mt-3">
                <p className="text-muted">Debug Info:</p>
                <p className="text-muted">API URL: {API_URL}</p>
                <p className="text-muted">Headers: {JSON.stringify(getHeaders())}</p>
                <p className="text-muted">User: {JSON.stringify(user)}</p>
                <p className="text-muted">Authenticated: {String(isAuthenticated)}</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-warning" onClick={loadProfile}>
                  Thử lại
                </button>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={() => {
                    // Force set demo data
                    setProfile({
                      email: user?.email || 'demo@example.com',
                      role: user?.role || 'user', 
                      createdAt: new Date().toISOString(),
                      hoTen: user?.name || 'Demo User',
                      ngaySinh: '',
                      gioiTinh: 'khac',
                      diaChi: '',
                      soDienThoai: '',
                      maBHYT: ''
                    });
                  }}
                >
                  Sử dụng dữ liệu demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Thông tin cá nhân
              </h4>
              <Link
                to="/user/edit-profile"
                className="btn btn-primary btn-sm"
              >
                <i className="bi bi-pencil-square me-1"></i>
                Chỉnh sửa
              </Link>
            </div>
            
            <div className="card-body">
              {/* Local Storage Warning */}
              {localStorage.getItem('user_profile') && (
                <div className="alert alert-info mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Dữ liệu local:</strong> Hiện tại đang hiển thị thông tin đã lưu trên trình duyệt. 
                  Để đồng bộ với server, vui lòng khởi động backend.
                  <button 
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={() => {
                      localStorage.removeItem('user_profile');
                      toast.info('Đã xóa dữ liệu local');
                      loadProfile();
                    }}
                  >
                    Xóa dữ liệu local
                  </button>
                </div>
              )}
              
              {/* Account Information */}
              <div className="row mb-4">
                <div className="col-12">
                  <h5 className="border-bottom pb-2 mb-3">
                    <i className="bi bi-shield-check me-2"></i>
                    Thông tin tài khoản
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong className="text-muted">Email:</strong>
                      <div className="ms-2">{profile.email}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong className="text-muted">Vai trò:</strong>
                      <div className="ms-2">
                        <span className={`badge ${
                          profile.role === 'admin' ? 'bg-danger' :
                          profile.role === 'doctor' ? 'bg-primary' :
                          'bg-secondary'
                        }`}>
                          {profile.role === 'admin' ? 'Quản trị viên' :
                           profile.role === 'doctor' ? 'Bác sĩ' :
                           profile.role === 'reception' ? 'Lễ tân' :
                           profile.role === 'lab' ? 'Xét nghiệm' : 'Người dùng'}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong className="text-muted">Ngày tạo:</strong>
                      <div className="ms-2">{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="row">
                <div className="col-12">
                  <h5 className="border-bottom pb-2 mb-3">
                    <i className="bi bi-person-badge me-2"></i>
                    Thông tin cá nhân
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong className="text-muted">Họ tên:</strong>
                      <div className="ms-2">{profile.hoTen || <em className="text-muted">Chưa cập nhật</em>}</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong className="text-muted">Ngày sinh:</strong>
                      <div className="ms-2">
                        {profile.ngaySinh ? 
                          new Date(profile.ngaySinh).toLocaleDateString('vi-VN') : 
                          <em className="text-muted">Chưa cập nhật</em>
                        }
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong className="text-muted">Giới tính:</strong>
                      <div className="ms-2">
                        {profile.gioiTinh === 'nam' ? 'Nam' :
                         profile.gioiTinh === 'nu' ? 'Nữ' :
                         profile.gioiTinh === 'khac' ? 'Khác' :
                         <em className="text-muted">Chưa cập nhật</em>
                        }
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong className="text-muted">Số điện thoại:</strong>
                      <div className="ms-2">{profile.soDienThoai || <em className="text-muted">Chưa cập nhật</em>}</div>
                    </div>
                    <div className="col-12 mb-3">
                      <strong className="text-muted">Địa chỉ:</strong>
                      <div className="ms-2">{profile.diaChi || <em className="text-muted">Chưa cập nhật</em>}</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong className="text-muted">Mã BHYT:</strong>
                      <div className="ms-2">{profile.maBHYT || <em className="text-muted">Chưa cập nhật</em>}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Link
                      to="/user/edit-profile"
                      className="btn btn-primary"
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Chỉnh sửa thông tin
                    </Link>
                    <Link
                      to="/user/change-password"
                      className="btn btn-outline-warning"
                    >
                      <i className="bi bi-key me-1"></i>
                      Đổi mật khẩu
                    </Link>
                  </div>
                  <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
                    <Link
                      to="/user/profiles"
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-people me-1"></i>
                      Quản lý hồ sơ người thân
                    </Link>
                    <Link
                      to="/booking/history"
                      className="btn btn-outline-info"
                    >
                      <i className="bi bi-clock-history me-1"></i>
                      Lịch sử đặt khám
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}