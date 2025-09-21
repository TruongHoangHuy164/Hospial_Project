import React from 'react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <div className="footer__brand">Bệnh viện Demo</div>
          <p>215 Đường Ví dụ, Quận 5, TP.HCM</p>
          <p>Tel: (028) 1234 5678 • Email: contact@hospital.demo</p>
        </div>
        <div>
          <h4>Liên kết</h4>
          <ul className="list">
            <li><a href="#">Chuyên khoa</a></li>
            <li><a href="#">Dịch vụ</a></li>
            <li><a href="#">Tin tức</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>
        <div>
          <h4>Kết nối</h4>
          <div className="socials">
            <a className="social" href="#" aria-label="Facebook">Fb</a>
            <a className="social" href="#" aria-label="YouTube">Yt</a>
          </div>
        </div>
      </div>
      <div className="footer__note">© 2025 Bệnh viện Demo. UI tham khảo bố cục bvchoray.vn.</div>
    </footer>
  )
}
