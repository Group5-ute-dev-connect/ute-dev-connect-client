import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, LogOut, Bell, Heart, MessageCircle, UserPlus, CheckCircle2, Star, Menu, X, Home, Users, FolderGit2, Search, Bookmark } from 'lucide-react';
import { logout } from '../../store/authSlice';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../store/notificationSlice';
import { profileApi } from '../../services/api/profileApi';

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
  const { token, role } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notification);

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reputation, setReputation] = useState(0);
  const notificationRef = useRef(null);

  const userPayload = token ? parseJwt(token) : null;
  const userId = userPayload ? userPayload.id : null;

  useEffect(() => {
    if (token) {
      dispatch(getUnreadCount());
      dispatch(getNotifications());
      profileApi.getProfile().then(res => {
         const profileData = res.data?.data || res.data;
         if (profileData && profileData.user) {
            setReputation(profileData.user.reputation || 0);
         }
      }).catch(err => console.error(err));
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
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg tracking-tighter">UTE</span>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                Connect
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Bảng tin
              </Link>
              <Link 
                to="/profiles" 
                className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Cộng đồng
              </Link>
              <Link 
                to="/groups" 
                className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Nhóm học tập
              </Link>
              <Link 
              to="/search" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Tìm kiếm
            </Link>
            {role === 'admin' && (
              <Link 
                to="/admin/filters" 
                className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3 py-2 rounded-md text-sm font-bold transition-all border border-rose-200"
              >
                Quản lý Bộ Lọc
              </Link>
            )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {token ? (
              <>
                <Link to="/chat" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all">
                  <MessageCircle size={18} />
                  <span>Tin nhắn</span>
                </Link>
                
                <div className="flex items-center gap-1.5 px-3 py-1.5 mx-1 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-bold text-indigo-700 transition-all cursor-default" title="Điểm Uy Tín (Reputation)">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{reputation}</span>
                </div>
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative"
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
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all">
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
                  className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  <User size={18} />
                  <span>Hồ sơ của tôi</span>
                </Link>

                <Link
                  to="/saved-posts"
                  className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  <Bookmark size={18} />
                  <span>Bài viết đã lưu</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
                >
                  Đăng ký
                </Link>
                <Link 
                  to="/auth/forgot-password" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/30 transition-all hover:shadow-md hover:shadow-blue-500/40"
                >
                  Quên mật khẩu
                </Link>
                <Link
                  to="/saved-posts"
                  className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Bài viết đã lưu
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 md:hidden transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-xs animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="font-bold text-lg text-gray-900">Danh mục</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-50 text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex flex-col space-y-1 overflow-y-auto flex-1">
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Home size={18} />
                Bảng tin
              </Link>
              <Link 
                to="/profiles" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Users size={18} />
                Cộng đồng
              </Link>
              <Link 
                to="/groups" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <FolderGit2 size={18} />
                Nhóm học tập
              </Link>
              <Link 
                to="/search" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Search size={18} />
                Tìm kiếm
              </Link>

              {token ? (
                <>
                  <Link 
                    to="/chat" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <MessageCircle size={18} />
                    Tin nhắn
                  </Link>
                  <Link 
                    to={userId ? `/profile/${userId}` : `/edit-profile`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <User size={18} />
                    Hồ sơ của tôi
                  </Link>
                  <Link 
                    to="/saved-posts" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Bookmark size={18} />
                    Bài viết đã lưu
                  </Link>
                  
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <LogOut size={18} />
                      Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2">
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex justify-center py-2 px-3 text-center text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors border border-gray-200"
                    >
                      Đăng nhập
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex justify-center py-2 px-3 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Đăng ký
                    </Link>
                    <Link 
                      to="/auth/forgot-password" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex justify-center py-2 px-3 text-center text-gray-500 hover:text-gray-700 text-xs font-semibold"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
