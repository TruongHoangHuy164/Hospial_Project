import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EditProfile() {
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
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'khac',
    diaChi: '',
    soDienThoai: '',
    maBHYT: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('EditProfile useEffect:', { isAuthenticated, user, headers });
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    console.log('Loading profile...');
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/profile`, { headers: getHeaders() });
      
      if (!response.ok) {
        throw new Error(`Không thể tải thông tin profile: ${response.status}`);
      }
      
      const data = await response.json();
      setProfile(data);
      
      setFormData({
        hoTen: data.hoTen || '',
        ngaySinh: data.ngaySinh ? new Date(data.ngaySinh).toISOString().split('T')[0] : '',
        gioiTinh: data.gioiTinh || 'khac',
        diaChi: data.diaChi || '',
        soDienThoai: data.soDienThoai || '',
        maBHYT: data.maBHYT || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin cá nhân - Sử dụng dữ liệu local');
      
      // Try to load from localStorage first
      let fallbackProfile;
      try {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          fallbackProfile = JSON.parse(savedProfile);
          console.log('Loaded profile from localStorage:', fallbackProfile);
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
      
      setProfile(fallbackProfile);
      
      setFormData({
        hoTen: fallbackProfile.hoTen || '',
        ngaySinh: fallbackProfile.ngaySinh ? new Date(fallbackProfile.ngaySinh).toISOString().split('T')[0] : '',
        gioiTinh: fallbackProfile.gioiTinh || 'khac',
        diaChi: fallbackProfile.diaChi || '',
        soDienThoai: fallbackProfile.soDienThoai || '',
        maBHYT: fallbackProfile.maBHYT || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Họ tên không được để trống';
    }
    
    if (formData.ngaySinh) {
      const birthDate = new Date(formData.ngaySinh);
      const today = new Date();
      if (birthDate > today) {
        newErrors.ngaySinh = 'Ngày sinh không thể là tương lai';
      }
    }
    
    if (formData.soDienThoai && !/^[0-9+\-\s()]{10,15}$/.test(formData.soDienThoai.replace(/\s/g, ''))) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ (10-15 số)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Cập nhật thất bại');
      }
      
      setProfile(data.profile);
      toast.success('Cập nhật thông tin thành công');
      
      // Go back to profile view
      navigate('/user/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.warning('Backend chưa chạy - Cập nhật dữ liệu local');
      
      // Update local state even if backend fails
      const updatedProfile = {
        ...profile,
        ...formData
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      
      setProfile(updatedProfile);
      toast.success('Đã cập nhật thông tin thành công (local storage)');
      
      // Navigate back to show "updated" info
      navigate('/user/profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate('/user/profile');
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
                <p className="text-muted">Authenticated: {String(isAuthenticated)}</p>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    console.log('Force continue with demo data');
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
                    setFormData({
                      hoTen: user?.name || 'Demo User',
                      ngaySinh: '',
                      gioiTinh: 'khac',
                      diaChi: '',
                      soDienThoai: '',
                      maBHYT: ''
                    });
                    setLoading(false);
                  }}
                >
                  Tiếp tục với dữ liệu demo
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
                <i className="bi bi-person-gear me-2"></i>
                Chỉnh sửa thông tin cá nhân
              </h4>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleCancel}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
              </button>
            </div>
            
            <div className="card-body">
              {profile && (
                <>
                  {/* Account Info Display */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <h6 className="alert-heading">
                          <i className="bi bi-info-circle me-2"></i>
                          Thông tin tài khoản
                        </h6>
                        <div className="row">
                          <div className="col-md-4">
                            <strong>Email:</strong> {profile.email}
                          </div>
                          <div className="col-md-4">
                            <strong>Vai trò:</strong> 
                            <span className={`badge ms-1 ${
                              profile.role === 'admin' ? 'bg-danger' :
                              profile.role === 'doctor' ? 'bg-primary' :
                              'bg-secondary'
                            }`}>
                              {profile.role}
                            </span>
                          </div>
                          <div className="col-md-4">
                            <strong>Ngày tạo:</strong> {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="hoTen" className="form-label">
                          Họ tên <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.hoTen ? 'is-invalid' : ''}`}
                          id="hoTen"
                          name="hoTen"
                          value={formData.hoTen}
                          onChange={handleChange}
                          placeholder="Nhập họ tên đầy đủ"
                        />
                        {errors.hoTen && (
                          <div className="invalid-feedback">{errors.hoTen}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="ngaySinh" className="form-label">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          className={`form-control ${errors.ngaySinh ? 'is-invalid' : ''}`}
                          id="ngaySinh"
                          name="ngaySinh"
                          value={formData.ngaySinh}
                          onChange={handleChange}
                        />
                        {errors.ngaySinh && (
                          <div className="invalid-feedback">{errors.ngaySinh}</div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="gioiTinh" className="form-label">
                          Giới tính
                        </label>
                        <select
                          className="form-select"
                          id="gioiTinh"
                          name="gioiTinh"
                          value={formData.gioiTinh}
                          onChange={handleChange}
                        >
                          <option value="khac">Khác</option>
                          <option value="nam">Nam</option>
                          <option value="nu">Nữ</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="soDienThoai" className="form-label">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          className={`form-control ${errors.soDienThoai ? 'is-invalid' : ''}`}
                          id="soDienThoai"
                          name="soDienThoai"
                          value={formData.soDienThoai}
                          onChange={handleChange}
                          placeholder="0123456789"
                        />
                        {errors.soDienThoai && (
                          <div className="invalid-feedback">{errors.soDienThoai}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="diaChi" className="form-label">
                        Địa chỉ
                      </label>
                      <textarea
                        className="form-control"
                        id="diaChi"
                        name="diaChi"
                        value={formData.diaChi}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Nhập địa chỉ đầy đủ"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="maBHYT" className="form-label">
                        Mã BHYT
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="maBHYT"
                        name="maBHYT"
                        value={formData.maBHYT}
                        onChange={handleChange}
                        placeholder="Nhập mã bảo hiểm y tế"
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Mã BHYT giúp giảm chi phí khám chữa bệnh
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={updating}
                      >
                        <i className="bi bi-x-lg me-1"></i>
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updating}
                      >
                        {updating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang cập nhật...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-1"></i>
                            Cập nhật thông tin
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}