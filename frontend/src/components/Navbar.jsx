import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="#" className="nav__item"><i className="bi bi-info-circle"></i> Giới thiệu</Link>
        <Link to="#" className="nav__item"><i className="bi bi-hospital"></i> Chuyên khoa</Link>
        <Link to="#" className="nav__item"><i className="bi bi-clipboard2-pulse"></i> Dịch vụ</Link>
        <Link to="#" className="nav__item"><i className="bi bi-newspaper"></i> Tin tức</Link>
        <Link to="#" className="nav__item"><i className="bi bi-clipboard-check"></i> Hướng dẫn khám</Link>
        <Link to="#" className="nav__item"><i className="bi bi-envelope"></i> Liên hệ</Link>
        <span className="flex-spacer" style={{ flex: 1 }} />
        {isAuthenticated && user?.role === 'admin' && (
          <Link to="/admin/overview" className="nav__item"><i className="bi bi-speedometer2"></i> Admin</Link>
        )}
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="nav__item"><i className="bi bi-box-arrow-in-right"></i> Đăng nhập</Link>
            <Link to="/register" className="nav__item"><i className="bi bi-person-plus"></i> Đăng ký</Link>
          </>
        ) : (
          <>
            <span className="nav__item">Xin chào, <strong>{user?.name || user?.email}</strong></span>
            <button className="nav__item btn btn-link p-0" onClick={signOut}>
              <i className="bi bi-box-arrow-right"></i> Đăng xuất
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
