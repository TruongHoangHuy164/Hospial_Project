import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const u = await signIn(email, password);
      if (u?.role === 'admin') {
        navigate('/admin/overview');
      } else if (u?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (u?.role === 'reception') {
        navigate('/reception/dashboard');
      } else if (u?.role === 'lab') {
        navigate('/lab/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-3">Đăng nhập</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Mật khẩu</label>
          <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-100" type="submit">Đăng nhập</button>
      </form>
      <div className="mt-3 d-flex justify-content-between">
        <Link to="/register">Tạo tài khoản</Link>
        <Link to="/forgot">Quên mật khẩu?</Link>
      </div>
    </div>
  );
}
