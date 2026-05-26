import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle2, User } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '../../store/notificationSlice';
import Spinner from '../../components/common/Spinner';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, unreadCount } = useSelector((state) => state.notification);
  
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }
    
    // Navigate based on type
    if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/post/${notification.post}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.sender._id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500 fill-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
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

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Thông báo của bạn</h2>
              <p className="text-sm text-gray-500">Bạn có {unreadCount} thông báo chưa đọc</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={() => dispatch(markAllAsRead())}
              className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <CheckCircle2 size={16} />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'unread' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Chưa đọc
            {unreadCount > 0 && filter !== 'unread' && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-50 min-h-[300px]">
          {loading && notifications.length === 0 ? (
            <div className="flex justify-center items-center p-12">
              <Spinner size="md" />
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div 
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/20' : ''}`}
              >
                <div className="relative flex-shrink-0 mt-1">
                  {notif.sender?.avatar ? (
                    <img src={notif.sender.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                      <User size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-base text-gray-800 leading-snug">
                    {getNotificationText(notif)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1.5 font-medium flex items-center gap-1">
                    {getTimeAgo(notif.createdAt)}
                  </p>
                </div>
                
                {!notif.isRead && (
                  <div className="w-3 h-3 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {filter === 'unread' ? 'Bạn đã đọc hết thông báo!' : 'Chưa có thông báo nào'}
              </h3>
              <p className="text-gray-500 max-w-sm">
                Khi có người tương tác với bài viết của bạn hoặc theo dõi bạn, thông báo sẽ xuất hiện ở đây.
              </p>
              <Link 
                to="/dashboard"
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Về bảng tin
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
