import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { signUp } = useAuth();
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signUp(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-3">Đăng ký</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Họ và tên</label>
          <input className="form-control" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Mật khẩu</label>
          <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-success w-100" type="submit">Tạo tài khoản</button>
      </form>
      <div className="mt-3">
        <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
      </div>
    </div>
  );
}
