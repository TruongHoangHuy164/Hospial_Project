import React from 'react'
import { Link } from 'react-router-dom'

const items = [
  { id: 1, label: 'Đặt lịch khám', icon: 'calendar2-check' },
  { id: 2, label: 'Tra cứu kết quả', icon: 'file-earmark-medical' },
  { id: 3, label: 'Bảng giá', icon: 'cash-stack' },
  { id: 4, label: 'Hướng dẫn khám', icon: 'clipboard-check' }
]

export default function Services() {
  return (
    <section className="services container">
      {items.map(i => (
        i.id === 1 ? (
          <Link key={i.id} to="/booking" className="service__item">
            <i className={`bi bi-${i.icon}`} style={{fontSize:'20px', marginRight: 8}}></i>
            {i.label}
          </Link>
        ) : (
          <a key={i.id} href="#" className="service__item">
            <i className={`bi bi-${i.icon}`} style={{fontSize:'20px', marginRight: 8}}></i>
            {i.label}
          </a>
        )
      ))}
    </section>
  )
}
