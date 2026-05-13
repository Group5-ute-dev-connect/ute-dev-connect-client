import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ForgotPassword from './pages/auth/ForgotPassword'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import Home from './Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      {/* Route mặc định: Điều hướng về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App;