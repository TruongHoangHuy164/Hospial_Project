import React from 'react'

const highlights = [
  { id: 1, title: 'Khai trương khu khám chất lượng cao' },
  { id: 2, title: 'Ứng dụng công nghệ mới trong chẩn đoán' },
  { id: 3, title: 'Chương trình tư vấn sức khỏe cộng đồng' }
]

export default function Highlights() {
  return (
    <section className="section container">
      <div className="section__head">
        <h2>Tin nổi bật</h2>
        <a href="#">Xem tất cả</a>
      </div>
      <div className="cards">
        {highlights.map(h => (
          <article key={h.id} className="card">
            <div className="card__thumb" />
            <h3 className="card__title">{h.title}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}
