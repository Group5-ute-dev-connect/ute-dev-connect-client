import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Home from "./Home";
import EditProfile from "./pages/profile/EditProfile";
import Profiles from "./pages/profile/Profiles";
import Profile from "./pages/profile/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import PostDetail from "./pages/posts/PostDetail";
import Dashboard from "./pages/dashboard/Dashboard";
import Chat from "./pages/chat/Chat";
import SavedPosts from "./pages/posts/SavedPosts";
import Notifications from "./pages/notifications/Notifications";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profiles" element={<Profiles />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/post/:id" element={<PostDetail />} />

      {/* Trang Dashboard - Bảng tin Newsfeed */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Các route yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/saved-posts" element={<SavedPosts />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Route mặc định: Điều hướng về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
