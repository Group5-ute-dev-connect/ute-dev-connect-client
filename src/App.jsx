import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import Home from './Home'
import EditProfile from './pages/profile/EditProfile'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      
      {/* Các route yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/edit-profile" element={<EditProfile />} />
      </Route>

      {/* Route mặc định: Điều hướng về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App;