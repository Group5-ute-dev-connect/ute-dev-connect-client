import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ForgotPassword from './pages/auth/ForgotPassword'
import Home from './Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        {/* Route mặc định: Điều hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App