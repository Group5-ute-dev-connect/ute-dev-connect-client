import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import adminApi from '../../services/api/adminApi';
import Avatar from '../../components/common/Avatar';
import { toast } from 'react-toastify';
import {
  Calendar,
  Filter,
  Search,
  Users,
  FileText,
  Layers,
  MessageSquare,
  Heart,
  Loader2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Trash2,
  Edit,
  PlusCircle,
  EyeOff
} from 'lucide-react';

const SystemLogsPage = () => {
  const { token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'like', 'comment', 'post', 'group'
  const [actionFilter, setActionFilter] = useState(''); // '', 'create', 'update', 'delete', 'like', 'unlike', 'join', 'leave'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getSubactionOptions = () => {
    switch (activeTab) {
      case 'post':
        return [
          { value: 'create', label: 'Tạo mới (Create)' },
          { value: 'update', label: 'Chỉnh sửa (Update)' },
          { value: 'delete', label: 'Xóa (Delete)' }
        ];
      case 'comment':
        return [
          { value: 'create', label: 'Tạo mới (Create)' },
          { value: 'update', label: 'Chỉnh sửa (Update)' },
          { value: 'delete', label: 'Xóa (Delete)' }
        ];
      case 'like':
        return [
          { value: 'like', label: 'Thích (Like)' },
          { value: 'unlike', label: 'Bỏ thích (Unlike)' }
        ];
      case 'group':
        return [
          { value: 'create', label: 'Tạo mới (Create)' },
          { value: 'join', label: 'Tham gia (Join)' },
          { value: 'leave', label: 'Rời nhóm (Leave)' },
          { value: 'delete', label: 'Xóa (Delete)' }
        ];
      default:
        return [
          { value: 'create', label: 'Tạo mới (Create)' },
          { value: 'update', label: 'Chỉnh sửa (Update)' },
          { value: 'delete', label: 'Xóa (Delete)' },
          { value: 'like', label: 'Thích (Like)' },
          { value: 'unlike', label: 'Bỏ thích (Unlike)' },
          { value: 'join', label: 'Tham gia nhóm (Join)' },
          { value: 'leave', label: 'Rời nhóm (Leave)' }
        ];
    }
  };

  // Reset actionFilter if it is not valid for the activeTab
  useEffect(() => {
    const validOptions = getSubactionOptions().map(opt => opt.value);
    if (actionFilter && !validOptions.includes(actionFilter)) {
      setActionFilter('');
    }
  }, [activeTab]);

  // Security check: Redirect if not admin
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (role !== 'admin') {
      const timer = setTimeout(() => {
        if (role !== 'admin') {
          navigate('/dashboard');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [token, role, navigate]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, actionFilter, startDate, endDate]);

  const fetchLogs = async () => {
    if (role !== 'admin') return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 15,
        type: activeTab,
        action: actionFilter || undefined,
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      
      const res = await adminApi.getSystemLogs(params);
      if (res.data?.success) {
        setLogs(res.data.logs || []);
        setTotalLogs(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Lỗi khi tải log hệ thống:', err);
      toast.error(err.response?.data?.message || 'Không thể tải nhật ký hoạt động từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && role === 'admin') {
      fetchLogs();
    }
  }, [token, role, currentPage, activeTab, actionFilter, debouncedSearch, startDate, endDate]);

  const handleClearFilters = () => {
    setActiveTab('all');
    setActionFilter('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'update':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'delete':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'like':
        return 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30';
      case 'unlike':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      case 'join':
        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
      case 'leave':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-850 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'create': return 'Tạo mới';
      case 'update': return 'Chỉnh sửa';
      case 'delete': return 'Xóa';
      case 'like': return 'Thích';
      case 'unlike': return 'Bỏ thích';
      case 'join': return 'Tham gia';
      case 'leave': return 'Rời nhóm';
      default: return action;
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const renderLogDescription = (log) => {
    const userName = log.user?.name || 'Ai đó';
    const postText = log.details?.text || '';
    const groupName = log.details?.name || log.group?.name || '';
    const commentText = log.details?.commentText || log.details?.text || '';

    switch (log.type) {
      case 'post':
        if (log.action === 'create') return `Đăng bài viết mới: "${postText.substring(0, 40)}${postText.length > 40 ? '...' : ''}"`;
        if (log.action === 'update') return `Chỉnh sửa bài viết: "${postText.substring(0, 40)}${postText.length > 40 ? '...' : ''}"`;
        if (log.action === 'delete') return `Xóa bài viết: "${postText.substring(0, 40)}${postText.length > 40 ? '...' : ''}"`;
        break;
      case 'comment':
        if (log.action === 'create') return `Bình luận bài viết: "${commentText.substring(0, 40)}${commentText.length > 40 ? '...' : ''}"`;
        if (log.action === 'update') return `Chỉnh sửa bình luận: "${commentText.substring(0, 40)}${commentText.length > 40 ? '...' : ''}"`;
        if (log.action === 'delete') return `Xóa bình luận: "${commentText.substring(0, 40)}${commentText.length > 40 ? '...' : ''}"`;
        break;
      case 'like':
        if (log.action === 'like') return 'Thích bài viết';
        if (log.action === 'unlike') return 'Bỏ thích bài viết';
        break;
      case 'group':
        if (log.action === 'create') return `Tạo nhóm học tập: "${groupName}"`;
        if (log.action === 'join') {
          if (log.details?.direct) return `Tham gia trực tiếp nhóm học tập: "${groupName}"`;
          if (log.details?.approvedBy) return `Yêu cầu tham gia nhóm "${groupName}" được duyệt`;
          return `Yêu cầu tham gia nhóm học tập: "${groupName}"`;
        }
        if (log.action === 'leave') return `Rời nhóm học tập: "${groupName}"`;
        if (log.action === 'delete') return `Xóa nhóm học tập: "${groupName}"`;
        break;
      default:
        return 'Hành động không xác định';
    }
  };

  // Redirect render for non-admin
  if (role && role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl text-center">
            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Truy Cập Bị Từ Chối</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Bạn không có quyền truy cập trang này. Trang này chỉ dành cho Admin tổng của hệ thống UTE Connect.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              Quay lại Bảng tin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/10 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <ShieldAlert className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Nhật Ký Hoạt Động Hệ Thống</h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Theo dõi toàn bộ lịch sử tương tác (Like, Bình luận, Đăng bài, Tham gia nhóm) nhằm đảm bảo tính minh bạch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Toolbar Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col gap-5">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-1 gap-2 border-b border-gray-150 dark:border-gray-700/60 scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0">
              {[
                { id: 'all', label: 'Tất cả', icon: ShieldAlert },
                { id: 'post', label: 'Bài đăng', icon: FileText },
                { id: 'comment', label: 'Bình luận', icon: MessageSquare },
                { id: 'like', label: 'Likes/Tương tác', icon: Heart },
                { id: 'group', label: 'Nhóm học tập', icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-transparent whitespace-nowrap transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Advanced Filters: Search, Subaction, Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Search input */}
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label className="text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tìm kiếm thành viên / nội dung</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tên, Email, MSSV hoặc nội dung log..."
                    className="w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-750 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Subaction select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hành động cụ thể</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-750 rounded-2xl px-3.5 py-2.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-semibold"
                >
                  <option value="">Tất cả</option>
                  {getSubactionOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Từ ngày</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-750 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:dark:invert"
                  />
                </div>
              </div>

              {/* End Date Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Đến ngày</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-750 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:dark:invert"
                  />
                </div>
              </div>
            </div>

            {/* Clear filters action */}
            {(actionFilter || searchQuery || startDate || endDate || activeTab !== 'all') && (
              <div className="flex justify-end -mt-2">
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-gray-400 hover:text-indigo-500 font-semibold transition-colors flex items-center gap-1.5"
                >
                  Xóa bộ lọc hoạt động
                </button>
              </div>
            )}
          </div>

          {/* Logs Output Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-750 shadow-sm">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 font-semibold">Đang truy vấn nhật ký hoạt động hệ thống...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-750/30 border-b border-gray-100 dark:border-gray-700/80">
                        <th className="px-6 py-4 text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Thời gian</th>
                        <th className="px-6 py-4 text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Thành viên</th>
                        <th className="px-6 py-4 text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hành động</th>
                        <th className="px-6 py-4 text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mô tả chi tiết</th>
                        <th className="px-6 py-4 text-2xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Liên kết nguồn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                      {logs.map((log) => {
                        const isPostDeleted = log.post?.isDeleted;
                        const isGroupDeleted = log.group && !log.group.isActive;
                        return (
                          <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/20 transition-colors">
                            {/* Date */}
                            <td className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(log.date)}
                            </td>
                            {/* User details */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar 
                                  src={log.user?.avatar} 
                                  alt={log.user?.name} 
                                  className="h-8.5 w-8.5 border border-gray-100 dark:border-gray-600"
                                />
                                <div>
                                  <h4 
                                    onClick={() => log.user?._id && navigate(`/profile/${log.user._id}`)}
                                    className="text-xs font-extrabold text-gray-800 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                                  >
                                    {log.user?.name || 'Người dùng hệ thống'}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                    {log.user?.studentId || log.user?.email || 'Hệ thống'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            {/* Action badge */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                                {getActionLabel(log.action)}
                              </span>
                            </td>
                            {/* Detail text */}
                            <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300 max-w-[320px] font-medium leading-relaxed">
                              {renderLogDescription(log)}
                            </td>
                            {/* Links/Badges */}
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {log.type === 'post' && log.post && (
                                <button
                                  onClick={() => navigate(`/post/${log.post._id}`)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 text-[11px] font-bold"
                                >
                                  Xem bài gốc {isPostDeleted && '(Đã xóa)'} <ExternalLink size={12} />
                                </button>
                              )}
                              {(log.type === 'comment' || log.type === 'like') && log.post && (
                                <>
                                  <button
                                    onClick={() => navigate(`/post/${log.post._id}`)}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 text-[11px] font-bold"
                                  >
                                    Xem bài đăng {isPostDeleted && '(Đã xóa)'} <ExternalLink size={12} />
                                  </button>
                                  {log.type === 'comment' && log.action === 'delete' && log.details?.text && (
                                    <div className="text-[9px] text-gray-400 mt-1 truncate max-w-[150px] mx-auto italic" title={log.details.text}>
                                      Log comment: "{log.details.text}"
                                    </div>
                                  )}
                                </>
                              )}
                              {log.type === 'group' && log.group && (
                                <>
                                  {isGroupDeleted ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                      <EyeOff size={11} /> Xóa mềm nhóm
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => navigate(`/groups/${log.group._id}`)}
                                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1 text-[11px] font-bold"
                                    >
                                      Truy cập nhóm <ExternalLink size={12} />
                                    </button>
                                  )}
                                </>
                              )}
                              {!log.post && !log.group && <span className="text-gray-400 text-[10px]">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="block md:hidden space-y-4">
                {logs.map((log) => {
                  const isPostDeleted = log.post?.isDeleted;
                  const isGroupDeleted = log.group && !log.group.isActive;
                  return (
                    <div 
                      key={log._id}
                      className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-4"
                    >
                      {/* Top Header: user info & date */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            src={log.user?.avatar} 
                            alt={log.user?.name} 
                            className="h-9 w-9 border border-gray-100 dark:border-gray-600"
                          />
                          <div>
                            <h4 
                              onClick={() => log.user?._id && navigate(`/profile/${log.user._id}`)}
                              className="text-xs font-black text-gray-800 dark:text-gray-200 hover:underline cursor-pointer"
                            >
                              {log.user?.name || 'Người dùng'}
                            </h4>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                              {log.user?.studentId || log.user?.email || 'Hệ thống'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold dark:text-gray-500 whitespace-nowrap">
                          {formatDate(log.date)}
                        </span>
                      </div>

                      {/* Middle description & badge */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize">{log.type}</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {renderLogDescription(log)}
                        </p>
                      </div>

                      {/* Bottom action panel */}
                      <div className="pt-3.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                        <div>
                          {log.type === 'comment' && log.action === 'delete' && log.details?.text && (
                            <span className="text-[9px] text-gray-400 font-medium italic block line-clamp-1 max-w-[180px]">
                              Bản sao: "{log.details.text}"
                            </span>
                          )}
                        </div>
                        <div>
                          {log.type === 'post' && log.post && (
                            <button
                              onClick={() => navigate(`/post/${log.post._id}`)}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 text-[11px] font-bold"
                            >
                              Xem bài gốc {isPostDeleted && '(Đã xóa)'} <ExternalLink size={12} />
                            </button>
                          )}
                          {(log.type === 'comment' || log.type === 'like') && log.post && (
                            <button
                              onClick={() => navigate(`/post/${log.post._id}`)}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 text-[11px] font-bold"
                            >
                              Xem bài đăng {isPostDeleted && '(Đã xóa)'} <ExternalLink size={12} />
                            </button>
                          )}
                          {log.type === 'group' && log.group && (
                            <>
                              {isGroupDeleted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                  Nhóm đã xóa mềm
                                </span>
                              ) : (
                                <button
                                  onClick={() => navigate(`/groups/${log.group._id}`)}
                                  className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 text-[11px] font-bold"
                                >
                                  Xem nhóm <ExternalLink size={12} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* No logs empty state */}
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-750 shadow-sm rounded-3xl text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl mb-4 text-gray-400 dark:text-gray-500">
                    <ShieldAlert size={36} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Không tìm thấy nhật ký nào</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5 max-w-xs leading-relaxed">
                    Hệ thống chưa ghi nhận hoạt động nào khớp với điều kiện lọc hiện tại.
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-4 rounded-2xl shadow-sm">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3.5 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-750/30 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Trước
                  </button>
                  <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3.5 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-750/30 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1"
                  >
                    Sau <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SystemLogsPage;
