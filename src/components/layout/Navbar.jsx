import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, LogOut, Bell, Heart, MessageCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { logout } from '../../store/authSlice';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../store/notificationSlice';

// Helper to decode token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notification);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const userPayload = token ? parseJwt(token) : null;
  const userId = userPayload ? userPayload.id : null;

  useEffect(() => {
    if (token) {
      dispatch(getUnreadCount());
      dispatch(getNotifications());
    }
  }, [dispatch, token]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }
    setShowNotifications(false);
    
    // Navigate based on type
    if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/post/${notification.post}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.sender._id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    const name = notification.sender?.name || 'Ai đó';
    switch(notification.type) {
      case 'like': return <><span className="font-semibold">{name}</span> đã thích bài viết của bạn.</>;
      case 'comment': return <><span className="font-semibold">{name}</span> đã bình luận về bài viết của bạn.</>;
      case 'follow': return <><span className="font-semibold">{name}</span> đã bắt đầu theo dõi bạn.</>;
      default: return 'Bạn có thông báo mới';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "Vừa xong";
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg tracking-tighter">UTE</span>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">
                Connect
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              to="/dashboard" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Bảng tin
            </Link>
            <Link 
              to="/profiles" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cộng đồng
            </Link>
            {token ? (
              <>
                <Link 
                  to="/chat" 
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                  <span className="hidden md:inline">Tin nhắn</span>
                </Link>
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all relative"
                  >
                    <Bell size={18} />
                    <span className="hidden md:inline">Thông báo</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full md:hidden">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <span className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 ml-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-800">Thông báo</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => dispatch(markAllAsRead())}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                          >
                            <CheckCircle2 size={14} />
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map(notif => (
                            <div 
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 border-b border-gray-50 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                              <div className="relative flex-shrink-0 mt-1">
                                {notif.sender?.avatar ? (
                                  <img src={notif.sender.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                                    <User size={16} className="text-gray-500" />
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                                  {getNotificationIcon(notif.type)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 leading-snug">
                                  {getNotificationText(notif)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {getTimeAgo(notif.createdAt)}
                                </p>
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                            <Bell className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-sm">Bạn không có thông báo nào</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                        <Link 
                          to="/notifications" 
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium block p-1"
                        >
                          Xem tất cả thông báo
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <Link 
                  to={userId ? `/profile/${userId}` : `/edit-profile`} 
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all"
                >
                  <User size={18} />
                  <span className="hidden md:inline">Hồ sơ của tôi</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-all"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors hidden sm:block"
                >
                  Đăng ký
                </Link>
                <Link 
                  to="/auth/forgot-password" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm shadow-blue-500/30 transition-all hover:shadow-md hover:shadow-blue-500/40"
                >
                  Quên mật khẩu
                </Link>
                <Link
                  to="/saved-posts"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Bài viết đã lưu
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
