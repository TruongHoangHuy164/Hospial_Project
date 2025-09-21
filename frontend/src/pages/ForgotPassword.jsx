import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setMsg(`Yêu cầu thành công. Token (demo): ${data.resetToken}`);
    } catch (err) {
      setError(err?.message || 'Lỗi gửi yêu cầu');
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-3">Quên mật khẩu</h3>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-100" type="submit">Gửi yêu cầu</button>
      </form>
    </div>
  );
}
