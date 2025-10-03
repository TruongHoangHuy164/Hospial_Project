import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChangePassword() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Create headers manually since AuthContext doesn't provide them
  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
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
      setLoading(true);
      const headers = getHeaders();
      console.log('Change password request:', {
        url: `${API_URL}/api/users/change-password`,
        headers,
        body: {
          currentPassword: '***',
          newPassword: '***'
        }
      });
      
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      console.log('Change password response:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('Change password response data:', data);
      
      if (!response.ok) {
        console.error('Change password failed:', data);
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
      }
      
      toast.success('Đổi mật khẩu thành công');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Go back to profile
      navigate('/user/profile');
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle different types of errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.warning('Backend chưa chạy - Không thể đổi mật khẩu');
        toast.info('Để đổi mật khẩu, vui lòng khởi động backend server');
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/user/profile');
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-key me-2"></i>
                Đổi mật khẩu
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
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Yêu cầu Backend:</strong> Chức năng đổi mật khẩu cần backend server để hoạt động. 
                Nếu server chưa chạy, vui lòng khởi động backend trước khi đổi mật khẩu.
              </div>
              
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Vì lý do bảo mật, bạn cần nhập mật khẩu hiện tại để xác nhận.
              </div>

              <div className="mb-3">
                <small className="text-muted">
                  API Endpoint: {API_URL}/api/users/change-password
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={async () => {
                      try {
                        const testHeaders = getHeaders();
                        const response = await fetch(`${API_URL}/api/users/profile`, { headers: testHeaders });
                        if (response.ok) {
                          toast.success('Backend đang hoạt động');
                        } else {
                          toast.error('Backend có lỗi: ' + response.status);
                        }
                      } catch (error) {
                        toast.error('Không thể kết nối backend');
                      }
                    }}
                  >
                    Test Backend
                  </button>
                </small>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">
                    Mật khẩu hiện tại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  {errors.currentPassword && (
                    <div className="invalid-feedback">{errors.currentPassword}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  {errors.newPassword && (
                    <div className="invalid-feedback">{errors.newPassword}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-1"></i>
                        Đổi mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}