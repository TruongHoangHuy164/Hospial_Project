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
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Footer from './components/Footer'
import RequireAdmin from './pages/admin/RequireAdmin'
import AdminLayout from './pages/admin/Layout'
import Overview from './pages/admin/Overview'
import Users from './pages/admin/Users'
import Doctors from './pages/admin/doctor/Index'
import Clinics from './pages/admin/clinic/Index'
import SiteLayout from './layouts/SiteLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
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
      </Route>

      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="overview" element={<Overview />} />
        <Route path="users" element={<Users />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="clinics" element={<Clinics />} />
      </Route>
    </Routes>
  )
}
