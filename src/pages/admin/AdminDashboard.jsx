import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import adminApi from '../../services/api/adminApi';
import Avatar from '../../components/common/Avatar';
import { toast } from 'react-toastify';
import {
  Users,
  FileText,
  Layers,
  MessageSquare,
  TrendingUp,
  ShieldAlert,
  Loader2,
  Calendar,
  Trophy,
  Eye,
  Heart,
  User,
  ArrowRight,
  Filter,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState('users'); // 'users', 'posts', 'groups'
  const [preset, setPreset] = useState('7d'); // '7d', '30d', 'custom'
  
  // Custom date pickers
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultStartStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState(defaultStartStr);
  const [customEndDate, setCustomEndDate] = useState(todayStr);

  // Security check: Redirect if not system admin
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

  // Fetch statistics data
  const fetchStats = async (params = {}) => {
    setLoading(true);
    try {
      const res = await adminApi.getSystemStats(params);
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu thống kê:', err);
      toast.error(err.response?.data?.message || 'Không thể tải số liệu thống kê từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && role === 'admin') {
      if (preset !== 'custom') {
        fetchStats({ preset });
      } else {
        fetchStats({ startDate: customStartDate, endDate: customEndDate });
      }
    }
  }, [token, role, preset]);

  // Apply custom date range
  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    if (!customStartDate || !customEndDate) {
      toast.warning('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }
    if (new Date(customStartDate) > new Date(customEndDate)) {
      toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
      return;
    }
    fetchStats({ startDate: customStartDate, endDate: customEndDate });
  };

  // Helper to render responsive custom SVG chart
  const renderSvgChart = (data = []) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-400">
          Không có dữ liệu trong khoảng thời gian này
        </div>
      );
    }

    const counts = data.map(d => d.count);
    const maxVal = Math.max(...counts, 1);
    const width = 800;
    const height = 220;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Generate coordinates for SVG Path
    const points = data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
      const y = height - paddingBottom - (d.count / maxVal) * chartHeight;
      return { x, y, label: d.date, count: d.count };
    });

    const pathD = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    // Shadow area path under the line
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : '';

    // Generate gridlines for Y-axis (4 levels)
    const gridLevels = 4;
    const yGridLines = Array.from({ length: gridLevels }).map((_, i) => {
      const ratio = i / (gridLevels - 1);
      const y = paddingTop + ratio * chartHeight;
      const val = Math.round(maxVal - ratio * maxVal);
      return { y, val };
    });

    // Determine horizontal ticks to show based on length
    const tickInterval = Math.max(1, Math.floor(data.length / 8));

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] p-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
            {/* Gridlines */}
            {yGridLines.map((line, idx) => (
              <g key={idx} className="opacity-30 dark:opacity-20">
                <line 
                  x1={paddingLeft} 
                  y1={line.y} 
                  x2={width - paddingRight} 
                  y2={line.y} 
                  stroke="currentColor" 
                  strokeDasharray="4,4" 
                  className="text-gray-300 dark:text-gray-600"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={line.y + 4} 
                  textAnchor="end" 
                  className="text-[10px] fill-gray-400 font-medium"
                >
                  {line.val}
                </text>
              </g>
            ))}

            {/* Area under the line */}
            {points.length > 0 && (
              <path 
                d={areaD} 
                fill="url(#chart-gradient)" 
                className="opacity-10 dark:opacity-20"
              />
            )}

            {/* Line Path */}
            {points.length > 0 && (
              <path 
                d={pathD} 
                fill="none" 
                stroke="url(#line-gradient)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Dots & Tooltips */}
            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="5" 
                  className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-gray-800 stroke-[2] hover:r-7 transition-all duration-150"
                />
                {/* Custom Label showing value on hover */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                  <rect 
                    x={p.x - 25} 
                    y={p.y - 30} 
                    width="50" 
                    height="20" 
                    rx="6" 
                    className="fill-gray-900 dark:fill-white"
                  />
                  <text 
                    x={p.x} 
                    y={p.y - 17} 
                    textAnchor="middle" 
                    className="text-[10px] font-bold fill-white dark:fill-gray-900"
                  >
                    {p.count}
                  </text>
                </g>
              </g>
            ))}

            {/* X-axis date labels */}
            {points.map((p, idx) => {
              if (idx % tickInterval !== 0 && idx !== points.length - 1) return null;
              // Format Date string: "YYYY-MM-DD" -> "DD/MM"
              const dateParts = p.label.split('-');
              const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : p.label;

              return (
                <text 
                  key={idx} 
                  x={p.x} 
                  y={height - 15} 
                  textAnchor="middle" 
                  className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium"
                >
                  {displayDate}
                </text>
              );
            })}

            {/* Definitions for Gradients */}
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
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

  const summary = stats?.summary || {};
  const growth = stats?.growth || {};
  const leaderboards = stats?.leaderboards || {};

  // Choose the growth data based on selected metric tab
  const getSelectedGrowthData = () => {
    if (chartMetric === 'posts') return growth.newPosts || [];
    if (chartMetric === 'groups') return growth.newGroups || [];
    return growth.newUsers || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/10 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Thống Kê Hệ Thống</h1>
                  <p className="text-indigo-100 text-sm mt-1">
                    Báo cáo số liệu người dùng, bài đăng, các nhóm học tập và hiệu năng hoạt động.
                  </p>
                </div>
              </div>

              {/* Time Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-white/10 dark:bg-black/20 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                <button
                  onClick={() => setPreset('7d')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${preset === '7d' ? 'bg-white text-indigo-700 shadow-md' : 'text-white hover:bg-white/10'}`}
                >
                  7 Ngày Qua
                </button>
                <button
                  onClick={() => setPreset('30d')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${preset === '30d' ? 'bg-white text-indigo-700 shadow-md' : 'text-white hover:bg-white/10'}`}
                >
                  30 Ngày Qua
                </button>
                <button
                  onClick={() => setPreset('custom')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${preset === 'custom' ? 'bg-white text-indigo-700 shadow-md' : 'text-white hover:bg-white/10'}`}
                >
                  Tùy Chọn
                </button>
              </div>
            </div>

            {/* Custom Date Range Picker Accordion */}
            {preset === 'custom' && (
              <form onSubmit={handleApplyCustomDates} className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-end gap-4 relative z-10 animate-fadeIn">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-indigo-100 flex items-center gap-1.5">
                    <Calendar size={14} /> Ngày bắt đầu:
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    max={todayStr}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50 focus:bg-white/20 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-indigo-100 flex items-center gap-1.5">
                    <Calendar size={14} /> Ngày kết thúc:
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    max={todayStr}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50 focus:bg-white/20 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white hover:bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-150 inline-flex items-center gap-2"
                >
                  <Filter size={14} /> Áp dụng
                </button>
              </form>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 font-medium">Đang tổng hợp dữ liệu thống kê...</p>
            </div>
          ) : (
            <>
              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-5 rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Thành Viên</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white mt-1">
                      {summary.totalUsers?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                {/* Total Posts */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-5 rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Bài Viết</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white mt-1">
                      {summary.totalPosts?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>

                {/* Total Groups */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-5 rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nhóm Học Tập</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white mt-1">
                      {summary.totalGroups?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-2xl">
                    <Layers className="h-6 w-6" />
                  </div>
                </div>

                {/* Total Comments */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-5 rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Bình Luận</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white mt-1">
                      {summary.totalComments?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-500 rounded-2xl">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Action Required / Moderation Stats Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {/* Pending Posts Count */}
                <div 
                  onClick={() => navigate('/admin/filters')}
                  className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-5 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-950/30 transition-all duration-150"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Kiểm Duyệt Bài Viết</h4>
                      <p className="text-xs text-amber-600 dark:text-amber-400/80 mt-0.5">Bài đăng chờ quản trị viên phê duyệt trên toàn hệ thống.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{summary.pendingPosts || 0}</span>
                    <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">Đang chờ</span>
                  </div>
                </div>

                {/* Banned Words Configuration */}
                <div 
                  onClick={() => navigate('/admin/filters')}
                  className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-5 flex items-center justify-between cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-950/30 transition-all duration-150"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-rose-500/10 dark:bg-rose-400/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">Từ Khóa Bị Cấm</h4>
                      <p className="text-xs text-rose-600 dark:text-rose-400/80 mt-0.5">Số lượng từ cấm đang được bộ lọc AI và hệ thống áp dụng để quét nội dung.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{summary.bannedWordsCount || 0}</span>
                    <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">Từ cấm</span>
                  </div>
                </div>
              </div>

              {/* Growth Timeline Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-5 sm:p-6 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                      <TrendingUp className="text-indigo-500" size={20} />
                      Biểu Đồ Tăng Trưởng Hoạt Động
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dữ liệu được cập nhật tự động theo mốc thời gian đã chọn.
                    </p>
                  </div>

                  {/* Switch Metric Tabs */}
                  <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-2xl max-w-sm">
                    <button
                      onClick={() => setChartMetric('users')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${chartMetric === 'users' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Mở tài khoản
                    </button>
                    <button
                      onClick={() => setChartMetric('posts')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${chartMetric === 'posts' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Bài đăng mới
                    </button>
                    <button
                      onClick={() => setChartMetric('groups')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${chartMetric === 'groups' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Nhóm học tập
                    </button>
                  </div>
                </div>

                {renderSvgChart(getSelectedGrowthData())}
              </div>

              {/* Leaderboards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Users */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
                    <h3 className="text-base font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                      <Trophy className="text-yellow-500" size={18} />
                      Top 5 Thành Viên Uy Tín
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {leaderboards.topUsers?.map((user, idx) => (
                      <div key={user._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-lg text-xs font-bold flex items-center justify-center ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {idx + 1}
                          </span>
                          <Avatar 
                            src={user.avatar} 
                            alt={user.name} 
                            className="h-9 w-9 border border-gray-100 dark:border-gray-600"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{user.name}</h4>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1">{user.email}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{user.reputation} XP</span>
                          <span className="block text-[9px] text-gray-400 capitalize mt-0.5">{user.role}</span>
                        </div>
                      </div>
                    ))}
                    {!leaderboards.topUsers?.length && (
                      <p className="text-xs text-gray-400 text-center py-6">Chưa có xếp hạng thành viên</p>
                    )}
                  </div>
                </div>

                {/* Top Groups */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
                    <h3 className="text-base font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                      <Layers className="text-purple-500" size={18} />
                      Top 5 Nhóm Học Tập
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {leaderboards.topGroups?.map((group, idx) => (
                      <div key={group._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-lg text-xs font-bold flex items-center justify-center ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{group.name}</h4>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 inline-flex items-center gap-1.5">
                              Admin: <strong className="font-semibold">{group.adminName || 'Ẩn danh'}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-purple-600 dark:text-purple-400">{group.membersCount} TV</span>
                          <span className="block text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">Thành viên</span>
                        </div>
                      </div>
                    ))}
                    {!leaderboards.topGroups?.length && (
                      <p className="text-xs text-gray-400 text-center py-6">Chưa có xếp hạng nhóm học tập</p>
                    )}
                  </div>
                </div>

                {/* Top Posts */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
                    <h3 className="text-base font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                      <FileText className="text-pink-500" size={18} />
                      Top 5 Bài Viết Quan Tâm
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {leaderboards.topPosts?.map((post, idx) => (
                      <div key={post._id} className="p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex flex-col gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className={`h-5 w-5 mt-0.5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {idx + 1}
                          </span>
                          <div className="flex-grow">
                            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                              {post.text}
                            </p>
                            <div className="flex items-center justify-between mt-2.5">
                              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Bởi {post.userName || 'Ẩn danh'}</span>
                              <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 text-[10px]">
                                <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                                <span className="flex items-center gap-1"><Heart size={12} /> {post.likesCount}</span>
                                <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentsCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!leaderboards.topPosts?.length && (
                      <p className="text-xs text-gray-400 text-center py-6">Chưa có xếp hạng bài đăng</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
