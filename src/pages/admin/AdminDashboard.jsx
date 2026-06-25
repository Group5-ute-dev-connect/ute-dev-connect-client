import React, { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, UsersRound, Activity, Server, ShieldCheck, TrendingUp, Trash2, Search, LayoutDashboard } from 'lucide-react';
import adminApi from '../../services/api/adminApi';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';

// --- Components ---

const OverviewTab = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Tổng Người Dùng',
      value: stats.totalUsers,
      icon: <Users className="w-7 h-7 text-blue-600" />,
      bgIcon: 'bg-blue-50',
      gradient: 'from-blue-500 to-indigo-600',
      delay: 'delay-100',
    },
    {
      title: 'Tổng Bài Viết',
      value: stats.totalPosts,
      icon: <FileText className="w-7 h-7 text-emerald-600" />,
      bgIcon: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-teal-600',
      delay: 'delay-200',
    },
    {
      title: 'Tổng Nhóm Học Tập',
      value: stats.totalGroups,
      icon: <UsersRound className="w-7 h-7 text-purple-600" />,
      bgIcon: 'bg-purple-50',
      gradient: 'from-purple-500 to-fuchsia-600',
      delay: 'delay-300',
    },
    {
      title: 'Tổng Tin Nhắn',
      value: stats.totalMessages,
      icon: <MessageSquare className="w-7 h-7 text-pink-600" />,
      bgIcon: 'bg-pink-50',
      gradient: 'from-pink-500 to-rose-600',
      delay: 'delay-400',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-44 rounded-3xl bg-white border border-gray-100 shadow-sm animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          ))
        ) : (
          statCards.map((stat, idx) => (
            <div
              key={idx}
              className={`relative group overflow-hidden rounded-3xl bg-white border border-gray-100 hover:border-blue-100 transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 animate-fade-in-up ${stat.delay}`}
              style={{ animationFillMode: 'both' }}
            >
              <div className="relative p-6 h-full flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className={`p-3.5 rounded-2xl ${stat.bgIcon} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                    <Activity className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-gray-500 font-medium text-sm mb-1">{stat.title}</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                      {stat.value.toLocaleString()}
                    </span>
                    <span className="flex items-center text-sm font-medium text-green-600 mb-1.5 bg-green-50 px-2 py-0.5 rounded-md">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      +12%
                    </span>
                  </div>
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-700 ease-out bg-gradient-to-r ${stat.gradient}`}></div>
            </div>
          ))
        )}
      </div>

      <div className="mt-10 rounded-3xl bg-white border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Server className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Trạng thái máy chủ</h3>
            <p className="text-gray-500">Cơ sở dữ liệu đang kết nối tốt. Băng thông khả dụng: <span className="font-semibold text-gray-700">98%</span></p>
          </div>
        </div>
      </div>
    </>
  );
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      if (response.data?.success) {
        setUsers(response.data.data);
      } else {
        toast.error('Lỗi tải danh sách người dùng');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${name}" không?`)) return;
    try {
      const response = await adminApi.deleteUser(id);
      if (response.data?.success) {
        toast.success('Đã xóa người dùng thành công');
        setUsers(users.filter(u => u._id !== id));
      } else {
        toast.error(response.data?.message || 'Lỗi khi xóa người dùng');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Danh sách người dùng</h3>
        <input 
          type="text" 
          placeholder="Tìm kiếm user..." 
          className="border border-gray-300 rounded px-3 py-1 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">{filteredUsers.length} Users</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Ngày tham gia</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Đang tải...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Không có người dùng nào.</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      disabled={user.role === 'admin'}
                      className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'opacity-30 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                      title="Xóa người dùng"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PostsTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPosts();
      if (response.data?.success) {
        setPosts(response.data.data);
      } else {
        toast.error('Lỗi tải danh sách bài viết');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này không?')) return;
    try {
      const response = await adminApi.deletePost(id);
      if (response.data?.success) {
        toast.success('Đã xóa bài viết');
        setPosts(posts.filter(p => p._id !== id));
      } else {
        toast.error(response.data?.message || 'Lỗi khi xóa bài viết');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Danh sách bài viết</h3>
        <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-bold">{posts.length} Posts</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Nội dung</th>
              <th className="px-6 py-4">Người đăng</th>
              <th className="px-6 py-4">Tương tác</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Đang tải...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Không có bài viết nào.</td>
              </tr>
            ) : (
              posts.map(post => (
                <tr key={post._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {post.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(post.date).toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm text-gray-800">{post.user?.name || 'Unknown'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.likes?.length || 0} Likes · {post.comments?.length || 0} Comments
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 0,
    totalMessages: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        const result = response.data;
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Người dùng', icon: <Users className="w-4 h-4" /> },
    { id: 'posts', label: 'Bài viết', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in-up flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <span>Trang quản trị hệ thống UTE Connect</span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Hệ thống ổn định
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8 flex space-x-2 border-b border-gray-200 animate-fade-in-up">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && <OverviewTab stats={stats} loading={loadingStats} />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'posts' && <PostsTab />}
          </div>

        </div>
      </main>

      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}} />
    </div>
  );
};

export default AdminDashboard;
