import React from 'react'
import { Link } from 'react-router-dom'

export default function AppointmentCTA() {
  return (
    <section className="cta">
      <div className="container cta__inner">
        <div>
          <h2>Đặt lịch khám trực tuyến</h2>
          <p>Tiết kiệm thời gian, chủ động lựa chọn bác sĩ và khung giờ.</p>
        </div>
        <Link className="btn btn--primary btn--lg" to="/booking">Đặt lịch ngay</Link>
      </div>
    </section>
  )
}
