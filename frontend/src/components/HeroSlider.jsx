import React from 'react'

const slides = [
  { id: 1, title: 'Chăm sóc sức khỏe toàn diện', desc: 'Dịch vụ y tế chất lượng cao cho cộng đồng' },
  { id: 2, title: 'Đội ngũ bác sĩ giàu kinh nghiệm', desc: 'Tận tâm - Chuyên nghiệp - Chuẩn mực' }
]

export default function HeroSlider() {
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4000)
    return () => clearInterval(t)
  }, [])

  const s = slides[idx]
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1>{s.title}</h1>
          <p>{s.desc}</p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="/booking">Đặt lịch ngay</a>
            <a className="btn btn--ghost" href="#">Xem dịch vụ</a>
          </div>
        </div>
      </div>
    </section>
  )
}
