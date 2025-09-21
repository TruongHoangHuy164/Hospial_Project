import React from 'react'

export default function Header() {
  return (
    <header className="header container">
      <a href="#" className="logo">
        <Logo />
        <div className="logo__text">
          <strong>Bệnh viện Demo</strong>
          <span>Chăm sóc tận tâm</span>
        </div>
      </a>
      <div className="header__search">
        <div className="input-group">
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input className="form-control" placeholder="Tìm bác sĩ, dịch vụ..." />
        </div>
      </div>
      <div className="header__cta">
  <a className="btn btn--primary" href="#"><i className="bi bi-calendar2-check"></i> Đặt lịch khám</a>
  <a className="btn btn--outline" href="tel:02812345678"><i className="bi bi-telephone"></i> Gọi: (028) 1234 5678</a>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
