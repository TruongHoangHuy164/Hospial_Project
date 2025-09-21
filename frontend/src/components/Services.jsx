import React from 'react'

const items = [
  { id: 1, label: 'Đặt lịch khám' },
  { id: 2, label: 'Tra cứu kết quả' },
  { id: 3, label: 'Bảng giá' },
  { id: 4, label: 'Hướng dẫn khám' }
]

export default function Services() {
  return (
    <section className="services container">
      {items.map(i => (
        <a key={i.id} href="#" className="service__item">{i.label}</a>
      ))}
    </section>
  )
}
