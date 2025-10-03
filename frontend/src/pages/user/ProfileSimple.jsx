import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user, headers, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'khac',
    diaChi: '',
    soDienThoai: '',
    maBHYT: ''
  });

  useEffect(() => {
    console.log('ProfileSimple useEffect:', { isAuthenticated, user, headers });
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping profile load');
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading profile with headers:', headers);
      console.log('API_URL:', API_URL);
      
      const response = await fetch(`${API_URL}/api/users/profile`, { headers });
      console.log('Profile response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile API error:', response.status, errorText);
        throw new Error(`Không thể tải thông tin profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Profile data received:', data);
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
      toast.error('Không thể tải thông tin cá nhân - Backend có thể chưa chạy');
      
      // Set mock data for demo purposes when backend is not available
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
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.hoTen.trim()) {
      return toast.error('Họ tên không được để trống');
    }
    
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Cập nhật thất bại');
      }
      
      setProfile(data.profile);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.warning('Backend chưa chạy - Chỉ cập nhật local data');
      
      // Update local state even if backend fails
      const updatedProfile = {
        ...profile,
        ...formData
      };
      setProfile(updatedProfile);
      toast.info('Đã cập nhật thông tin local (cần backend để lưu database)');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Vui lòng đăng nhập để xem thông tin cá nhân</h1>
        <p>isAuthenticated: {String(isAuthenticated)}</p>
        <p>User: {JSON.stringify(user)}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Đang tải thông tin...</p>
        <p>API URL: {API_URL}</p>
        <p>Headers: {JSON.stringify(headers)}</p>
        <button onClick={() => {
          console.log('Manual test API call');
          fetch(`${API_URL}/api/users/profile`, { headers })
            .then(r => {
              console.log('Manual test response:', r.status);
              return r.json();
            })
            .then(data => console.log('Manual test data:', data))
            .catch(err => console.error('Manual test error:', err));
        }}>
          Test API Call
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Thông tin cá nhân</h1>
      
      {profile && (
        <>
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h2>Thông tin tài khoản</h2>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Vai trò:</strong> {profile.role}</p>
            <p><strong>Ngày tạo:</strong> {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h2>Cập nhật thông tin</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Họ tên *
              </label>
              <input
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Ngày sinh
              </label>
              <input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Giới tính
              </label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="khac">Khác</option>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Địa chỉ
              </label>
              <textarea
                name="diaChi"
                value={formData.diaChi}
                onChange={handleChange}
                rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Mã BHYT
              </label>
              <input
                type="text"
                name="maBHYT"
                value={formData.maBHYT}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={loadProfile}
                style={{ 
                  padding: '10px 20px', 
                  background: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy thay đổi
              </button>
              <button
                type="submit"
                style={{ 
                  padding: '10px 20px', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cập nhật thông tin
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;