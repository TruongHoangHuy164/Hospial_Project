import React from 'react'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar__inner">
  <a href="#" className="nav__item"><i className="bi bi-info-circle"></i> Giới thiệu</a>
  <a href="#" className="nav__item"><i className="bi bi-hospital"></i> Chuyên khoa</a>
  <a href="#" className="nav__item"><i className="bi bi-clipboard2-pulse"></i> Dịch vụ</a>
  <a href="#" className="nav__item"><i className="bi bi-newspaper"></i> Tin tức</a>
  <a href="#" className="nav__item"><i className="bi bi-clipboard-check"></i> Hướng dẫn khám</a>
  <a href="#" className="nav__item"><i className="bi bi-envelope"></i> Liên hệ</a>
      </div>
    </nav>
  )
}
