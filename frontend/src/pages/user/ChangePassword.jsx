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

  const [step, setStep] = useState(1); // 1: Enter current password, 2: Enter OTP + new password
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpInfo, setOtpInfo] = useState(null); // { email, expiresAt }
  const [timeLeft, setTimeLeft] = useState(0); // Countdown timer in seconds

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && otpInfo) {
      setOtpInfo(null);
      setStep(1);
      toast.error('Mã OTP đã hết hạn. Vui lòng thử lại.');
    }
    return () => clearInterval(interval);
  }, [timeLeft, otpInfo]);

  // Format time left for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.otp) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải có 6 chữ số';
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

  const requestOtp = async (e) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${API_URL}/api/users/request-change-password-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: formData.currentPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.message || 'Có lỗi xảy ra');
        }
        return;
      }
      
      // Set OTP info and countdown
      setOtpInfo({ email: data.email, expiresAt: data.expiresAt });
      setTimeLeft(180); // 3 minutes = 180 seconds
      setStep(2);
      toast.success('Mã OTP đã được gửi về email của bạn!');
      
    } catch (error) {
      console.error('Request OTP error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi gửi mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${API_URL}/api/users/verify-change-password-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          otp: formData.otp,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.message || 'Có lỗi xảy ra');
        }
        return;
      }
      
      toast.success('Đổi mật khẩu thành công!');
      
      // Reset form and step
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        otp: ''
      });
      setStep(1);
      setOtpInfo(null);  
      setTimeLeft(0);
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi xác thực OTP');
    } finally {
      setLoading(false);
    }
  };

  const goBackToStep1 = () => {
    setStep(1);
    setOtpInfo(null);
    setTimeLeft(0);
    setFormData(prev => ({
      ...prev,
      otp: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setErrors({});
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
                Đổi mật khẩu {step === 2 && '- Xác thực OTP'}
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
              {step === 2 && otpInfo && (
                <div className="alert alert-info">
                  <i className="bi bi-envelope me-2"></i>
                  Mã OTP đã được gửi về email: <strong>{otpInfo.email}</strong>
                  <br />
                  <i className="bi bi-clock me-2"></i>
                  Thời gian còn lại: <strong className="text-danger">{formatTime(timeLeft)}</strong>
                </div>
              )}
              
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                {step === 1 
                  ? 'Vì lý do bảo mật, bạn cần nhập mật khẩu hiện tại để nhận mã OTP qua email.'
                  : 'Nhập mã OTP từ email và mật khẩu mới để hoàn tất thay đổi mật khẩu.'
                }
              </div>

              {step === 1 ? (
                <form onSubmit={requestOtp}>
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
                      required
                    />
                    {errors.currentPassword && (
                      <div className="invalid-feedback">
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope me-2"></i>
                          Gửi mã OTP
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={verifyOtpAndChangePassword}>
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">
                      Mã OTP <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Nhập mã OTP (6 chữ số)"
                      maxLength="6"
                      required
                    />
                    {errors.otp && (
                      <div className="invalid-feedback">
                        {errors.otp}
                      </div>
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
                      required
                    />
                    {errors.newPassword && (
                      <div className="invalid-feedback">
                        {errors.newPassword}
                      </div>
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
                      required
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={goBackToStep1}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang xác thực...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-check me-2"></i>
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}