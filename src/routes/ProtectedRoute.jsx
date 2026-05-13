import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Nếu không có token, chuyển hướng về trang chủ hoặc đăng nhập
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
