import React from 'react'

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="container topbar__inner">
  <div className="topbar__left"><i className="bi bi-telephone-fill"></i> Hotline: <a href="tel:02812345678">(028) 1234 5678</a></div>
        <div className="topbar__right">
          <a href="#">VN</a>
          <span> | </span>
          <a href="#">EN</a>
        </div>
      </div>
    </div>
  )
}
