import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ForgotPassword from './pages/auth/ForgotPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        {/* Tạm thời chuyển hướng các route khác về forgot password để test */}
        <Route path="*" element={<Navigate to="/auth/forgot-password" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App