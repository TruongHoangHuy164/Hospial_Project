import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import Header from './components/Header'
import Navbar from './components/Navbar'
import HeroSlider from './components/HeroSlider'
import Services from './components/Services'
import Highlights from './components/Highlights'
import Notices from './components/Notices'
import AppointmentCTA from './components/AppointmentCTA'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Topbar />
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <HeroSlider />
            <Services />
            <div className="container grid-2">
              <Highlights />
              <Notices />
            </div>
            <AppointmentCTA />
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </>
  )
}
