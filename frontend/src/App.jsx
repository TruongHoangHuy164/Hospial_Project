import React from 'react'
import Topbar from './components/Topbar'
import Header from './components/Header'
import Navbar from './components/Navbar'
import HeroSlider from './components/HeroSlider'
import Services from './components/Services'
import Highlights from './components/Highlights'
import Notices from './components/Notices'
import AppointmentCTA from './components/AppointmentCTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Topbar />
      <Header />
      <Navbar />
      <HeroSlider />
      <Services />
      <div className="container grid-2">
        <Highlights />
        <Notices />
      </div>
      <AppointmentCTA />
      <Footer />
    </>
  )
}
