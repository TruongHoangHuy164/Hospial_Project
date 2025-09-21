import React from 'react'

const notices = [
  { id: 1, text: 'Thông báo lịch khám chuyên khoa tuần này' },
  { id: 2, text: 'Hướng dẫn quy trình khám bệnh lần đầu' },
  { id: 3, text: 'Lịch nghỉ lễ và sắp xếp khám bù' }
]

export default function Notices() {
  return (
    <section className="section container">
      <div className="section__head">
        <h2>Thông báo</h2>
      </div>
      <ul className="notices">
        {notices.map(n => (
          <li key={n.id} className="notice"><i className="bi bi-exclamation-circle text-warning"></i> {n.text}</li>
        ))}
      </ul>
    </section>
  )
}
