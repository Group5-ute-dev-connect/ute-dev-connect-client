import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import groupApi from '../../services/api/groupApi';
import { postApi } from '../../services/api/postApi';
import { 
  Users, ArrowLeft, Loader2, MessageSquare, ThumbsUp, 
  Send, Shield, Calendar, SendHorizontal, AlertCircle, LogOut, Lock,
  HelpCircle, MessageSquarePlus, Eye, Edit2, CheckCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CommentSection from '../../components/interactions/CommentSection';

// Helper to decode token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const userPayload = token ? parseJwt(token) : null;
  const userId = userPayload ? userPayload.id : null;

  // States
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Post & Comment States
  const [newPostText, setNewPostText] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [expandedComments, setExpandedComments] = useState({}); // { [postId]: boolean }
  const [isQuestion, setIsQuestion] = useState(false);
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isPreview, setIsPreview] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'members' or 'pending'
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Fetch Group Info & Feed
  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const response = await groupApi.getGroupById(id);
      const groupData = response.data?.data || response.data || null;
      setGroup(groupData);
      
      // Calculate membership in frontend
      const isMember = userId && groupData?.members?.some(
        (m) => (m.user?._id || m.user || '').toString() === userId.toString()
      );
      const isAdmin = userId && (groupData?.admin?._id || groupData?.admin || '').toString() === userId.toString();
      const isUserMod = userId && groupData?.moderators?.some(
        (m) => (m._id || m || '').toString() === userId.toString()
      );

      // If member/admin, fetch internal feed
      if (groupData && (isMember || isAdmin)) {
        await fetchFeed();
        
        // If admin/mod, fetch pending posts count
        if (isAdmin || isUserMod) {
          try {
            const pendingResponse = await groupApi.getPendingPosts(id);
            setPendingPosts(pendingResponse.data?.data || pendingResponse.data || []);
          } catch (e) {
            console.error('Lỗi khi lấy số lượng bài viết chờ duyệt:', e);
          }
        }
      }
      setError('');
    } catch (err) {
      console.error('Lỗi khi tải chi tiết nhóm:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin nhóm học tập.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeed = async () => {
    try {
      setFeedLoading(true);
      const response = await groupApi.getGroupFeed(id);
      const feedPosts = response.data?.data || response.data || [];
      setPosts(feedPosts);
    } catch (err) {
      console.error('Lỗi khi tải bảng tin nhóm:', err);
      toast.error('Không thể tải bảng tin nhóm.');
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchPendingPosts = async () => {
    try {
      setPendingLoading(true);
      const response = await groupApi.getPendingPosts(id);
      setPendingPosts(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải bài đăng chờ duyệt:', err);
      toast.error('Không thể tải bài đăng chờ duyệt.');
    } finally {
      setPendingLoading(false);
    }
  };

  const handleToggleModerator = async (targetUserId) => {
    try {
      const res = await groupApi.toggleModerator(id, targetUserId);
      if (res.data) {
        toast.success(res.data.message || 'Cập nhật quyền kiểm duyệt viên thành công');
        fetchGroupData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật quyền kiểm duyệt viên.');
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      const res = await groupApi.approvePost(id, postId);
      if (res.data) {
        toast.success('Đã phê duyệt bài viết.');
        setPendingPosts(prev => prev.filter(p => p._id !== postId));
        fetchFeed();
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể phê duyệt bài viết.');
    }
  };

  const handleRejectPost = async (postId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối và xóa bài viết này?')) {
      return;
    }
    try {
      const res = await groupApi.rejectPost(id, postId);
      if (res.data) {
        toast.success('Đã từ chối bài viết.');
        setPendingPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể từ chối bài viết.');
    }
  };

  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id]);

  // Handle Join Group
  const handleJoin = async () => {
    if (!token) {
      toast.info('Vui lòng đăng nhập để tham gia nhóm.');
      navigate('/login');
      return;
    }
    try {
      const response = await groupApi.joinGroup(id);
      if (response.success || response.data) {
        toast.success(`Đã tham gia nhóm thành công!`);
        fetchGroupData();
      }
    } catch (err) {
      console.error('Lỗi tham gia nhóm:', err);
      toast.error(err.response?.data?.message || 'Không thể tham gia nhóm.');
    }
  };

  // Handle Leave Group
  const handleLeave = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn rời khỏi nhóm này không?`)) {
      return;
    }
    try {
      const response = await groupApi.leaveGroup(id);
      if (response.success || response.data) {
        toast.success('Đã rời khỏi nhóm học tập.');
        navigate('/groups');
      }
    } catch (err) {
      console.error('Lỗi rời nhóm:', err);
      toast.error(err.response?.data?.message || 'Không thể rời nhóm.');
    }
  };

  // Handle Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) {
      toast.warning('Vui lòng nhập nội dung bài viết.');
      return;
    }
    setSubmittingPost(true);
    try {
      const response = await groupApi.createGroupPost(
        id,
        newPostText.trim(),
        isQuestion,
        showCodeSnippet ? codeSnippet : '',
        showCodeSnippet ? codeLanguage : 'javascript'
      );
      if (response.success || response.data) {
        toast.success('Đăng bài thành công!');
        setNewPostText('');
        setCodeSnippet('');
        setShowCodeSnippet(false);
        setIsQuestion(false);
        setIsPreview(false);
        fetchFeed();
      }
    } catch (err) {
      console.error('Lỗi đăng bài trong nhóm:', err);
      toast.error(err.response?.data?.message || 'Đăng bài thất bại.');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Handle Like/Unlike Post
  const handleLike = async (postId) => {
    if (!token) {
      toast.info('Vui lòng đăng nhập để thích bài viết.');
      return;
    }
    try {
      const response = await postApi.likePost(postId);
      const data = response.data;
      
      // Update local state directly
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              likes: data.likes || data.data || post.likes // Fallback
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Lỗi khi thích bài viết:', err);
    }
  };

  // Toggle comments expand
  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="mt-3 text-gray-500 text-sm font-medium">Đang tải thông tin nhóm...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="max-w-3xl mx-auto mt-10 px-4 flex-grow w-full">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-2 border border-red-100 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error || 'Nhóm học tập không tồn tại hoặc đã bị xóa.'}</span>
          </div>
          <Link to="/groups" className="inline-flex items-center text-indigo-600 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh sách nhóm
          </Link>
        </div>
      </div>
    );
  }

  const isUserMember = userId && group.members?.some(
    (m) => (m.user?._id || m.user || '').toString() === userId.toString()
  );
  const isUserAdmin = userId && (group.admin?._id || group.admin || '').toString() === userId.toString();
  const isUserMod = userId && group.moderators?.some(
    (m) => (m._id || m || '').toString() === userId.toString()
  );
  const canModerate = isUserAdmin || isUserMod;

  // Format Date
  const formattedDate = new Date(group.date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const tabs = [
    { id: 'feed', label: 'Thảo luận' },
    { id: 'members', label: `Thành viên (${group.members?.length || 0})` }
  ];
  if (canModerate) {
    tabs.splice(1, 0, { id: 'pending', label: `Duyệt bài (${pendingPosts.length})` });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Back button */}
          <Link to="/groups" className="inline-flex items-center mb-6 text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh sách nhóm
          </Link>

          {/* Group Banner */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            </div>
            
            <div className="p-6 md:p-8 relative pt-4 md:pt-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight">
                      {group.name}
                    </h1>
                    {isUserAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        <Shield className="w-3 h-3 mr-0.5" />
                        Quản trị
                      </span>
                    )}
                    {isUserMod && !isUserAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <Shield className="w-3 h-3 mr-0.5" />
                        Kiểm duyệt viên
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                    {group.description || 'Chưa có mô tả cho nhóm này.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <strong>{group.membersCount || 0}</strong> thành viên
                    </span>
                    <span>•</span>
                    <span>Tạo ngày {formattedDate}</span>
                    <span>•</span>
                    <span>Admin: <strong className="font-semibold text-gray-700">{group.admin?.name || 'Ẩn danh'}</strong></span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isUserMember ? (
                    !isUserAdmin ? (
                      <button
                        onClick={handleLeave}
                        className="inline-flex items-center px-4 py-2.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-700 font-semibold rounded-xl text-sm transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Rời nhóm
                      </button>
                    ) : (
                      <span className="text-xs text-purple-600 bg-purple-50 font-semibold px-4 py-2.5 rounded-xl border border-purple-100 inline-block">
                        Chủ nhóm học tập
                      </span>
                    )
                  ) : (
                    <button
                      onClick={handleJoin}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-indigo-500/10"
                    >
                      Tham gia nhóm
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Responsive) */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'pending') {
                    fetchPendingPosts();
                  }
                }}
                className={`flex-grow py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Content Area (Feed or Pending Posts) */}
            <div className={`md:col-span-2 ${activeTab === 'members' ? 'hidden md:block' : ''}`}>
              
              {/* Check if member */}
              {!isUserMember ? (
                <div className="bg-white rounded-2xl border border-gray-150 p-8 text-center shadow-sm">
                  <div className="h-14 w-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Nhóm Riêng Tư</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Nội dung bảng tin, mã nguồn thảo luận chỉ hiển thị với thành viên trong nhóm này.
                  </p>
                  <button
                    onClick={handleJoin}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Tham gia nhóm thảo luận
                  </button>
                </div>
              ) : (
                <>
                  {/* TAB 1: DISCUSSION FEED */}
                  {activeTab === 'feed' && (
                    <>
                      {/* Create Post Form */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                            {isQuestion ? (
                              <HelpCircle className="w-4 h-4 mr-1.5 text-indigo-600 animate-pulse" />
                            ) : (
                              <MessageSquarePlus className="w-4 h-4 mr-1.5 text-blue-600" />
                            )}
                            {isQuestion ? 'Đặt câu hỏi thảo luận' : 'Đăng bài viết mới'}
                          </h3>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center cursor-pointer">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isQuestion}
                                  onChange={() => setIsQuestion(!isQuestion)}
                                />
                                <div className={`block w-8 h-5 rounded-full transition-colors ${isQuestion ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isQuestion ? 'transform translate-x-3' : ''}`}></div>
                              </div>
                              <div className="ml-2 text-xs font-semibold text-gray-600">Câu hỏi Q&A</div>
                            </label>

                            <label className="flex items-center cursor-pointer">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={showCodeSnippet}
                                  onChange={() => setShowCodeSnippet(!showCodeSnippet)}
                                />
                                <div className={`block w-8 h-5 rounded-full transition-colors ${showCodeSnippet ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showCodeSnippet ? 'transform translate-x-3' : ''}`}></div>
                              </div>
                              <div className="ml-2 text-xs font-semibold text-gray-600">Mã nguồn (Code)</div>
                            </label>
                          </div>
                        </div>

                        <div className="flex space-x-2 mb-3 border-b border-gray-50 pb-2">
                          <button
                            type="button"
                            onClick={() => setIsPreview(false)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center transition-colors ${!isPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Viết bài
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsPreview(true)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center transition-colors ${isPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Xem trước
                          </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="space-y-3">
                          {!isPreview ? (
                            <>
                              <textarea
                                placeholder={isQuestion ? "Miêu tả chi tiết câu hỏi/vấn đề code bạn đang gặp phải..." : "Thảo luận code, tài liệu môn học, tìm thành viên..."}
                                value={newPostText}
                                onChange={(e) => setNewPostText(e.target.value)}
                                rows={3}
                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
                              />

                              {showCodeSnippet && (
                                <div className="p-4 border border-blue-100 rounded-xl bg-slate-50">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                                      <span className="font-mono mr-1">&lt;/&gt;</span> Mã nguồn chèn
                                    </span>
                                    <select
                                      value={codeLanguage}
                                      onChange={(e) => setCodeLanguage(e.target.value)}
                                      className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                    >
                                      <option value="javascript">JavaScript</option>
                                      <option value="python">Python</option>
                                      <option value="cpp">C++</option>
                                      <option value="html">HTML</option>
                                      <option value="css">CSS</option>
                                      <option value="java">Java</option>
                                      <option value="go">Go</option>
                                    </select>
                                  </div>
                                  <textarea
                                    value={codeSnippet}
                                    onChange={(e) => setCodeSnippet(e.target.value)}
                                    placeholder="Viết hoặc dán code của bạn ở đây..."
                                    rows={5}
                                    className="w-full font-mono text-xs px-3 py-2 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="p-4 border rounded-xl bg-gray-50 min-h-[96px] text-sm text-slate-800 prose prose-slate prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
                              {newPostText ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({node, inline, className, children, ...props}) {
                                      const match = /language-(\w+)/.exec(className || '')
                                      return !inline && match ? (
                                        <SyntaxHighlighter
                                          {...props}
                                          children={String(children).replace(/\n$/, '')}
                                          style={vscDarkPlus}
                                          language={match[1]}
                                          PreTag="div"
                                          className="rounded-md my-2"
                                        />
                                      ) : (
                                        <code {...props} className={`${className} bg-gray-150 text-red-500 px-1 py-0.5 rounded text-xs font-mono`}>
                                          {children}
                                        </code>
                                      )
                                    }
                                  }}
                                >
                                  {newPostText}
                                </ReactMarkdown>
                              ) : (
                                <span className="text-gray-400 italic">Chưa có nội dung xem trước...</span>
                              )}

                              {showCodeSnippet && codeSnippet && (
                                <div className="mt-3 border-t border-gray-200 pt-3">
                                  <span className="text-xs font-bold text-slate-500 block mb-1">Mã nguồn ({codeLanguage}):</span>
                                  <SyntaxHighlighter
                                    children={codeSnippet}
                                    style={vscDarkPlus}
                                    language={codeLanguage}
                                    PreTag="div"
                                    className="rounded-md my-2 text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2">
                            <div className="text-2xs text-gray-400 font-medium">Hỗ trợ Markdown (ví dụ: `code`, **in đậm**)</div>
                            <button
                              type="submit"
                              disabled={submittingPost}
                              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95"
                            >
                              {submittingPost ? (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              ) : (
                                <SendHorizontal className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {isQuestion ? 'Đăng câu hỏi' : 'Đăng bài'}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Feed list */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                          Bài viết thảo luận ({posts.length})
                        </h3>

                        {feedLoading && posts.length === 0 ? (
                          <div className="text-center py-10">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                            <span className="text-sm text-gray-500">Đang tải bài viết...</span>
                          </div>
                        ) : posts.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-gray-150 p-10 text-center shadow-sm text-gray-500">
                            Chưa có bài thảo luận nào trong nhóm này. Hãy đăng bài đầu tiên!
                          </div>
                        ) : (
                          posts.map((post) => {
                            const postLikesCount = post.likes?.length || 0;
                            const isLiked = userId && post.likes?.some(
                              (l) => (l.user?._id || l.user || '').toString() === userId.toString()
                            );
                            const postDate = new Date(post.date).toLocaleDateString('vi-VN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });

                            return (
                              <div key={post._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {post.status === 'pending' && (
                                  <div className="bg-amber-50 text-amber-800 px-5 py-3 border-b border-amber-100 flex items-center gap-1.5 text-xs font-semibold">
                                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                    <span>Bài viết này đang chờ duyệt. Chỉ bạn và Quản trị viên nhóm mới nhìn thấy.</span>
                                  </div>
                                )}

                                {/* Post Header */}
                                <div className="p-5 flex items-center space-x-3 border-b border-gray-50">
                                  <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={post.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                                      alt={post.name} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-sm font-bold text-gray-900">{post.name || 'Thành viên'}</h4>
                                      {post.user?.reputation !== undefined && (
                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-3xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-3xs" title="Điểm uy tín">
                                          ★ {post.user.reputation}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                      <Calendar className="w-3.5 h-3.5 mr-1" />
                                      <span>{postDate}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Post Body */}
                                <div className="p-5 space-y-3">
                                  <div className="flex flex-wrap gap-1.5 mb-1">
                                    {post.isQuestion && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-150">
                                        <HelpCircle className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Câu hỏi
                                      </span>
                                    )}
                                    {post.isQuestion && post.acceptedAnswer && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-150">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" /> Đã giải quyết
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-gray-800 text-sm leading-relaxed prose prose-slate prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        code({node, inline, className, children, ...props}) {
                                          const match = /language-(\w+)/.exec(className || '')
                                          return !inline && match ? (
                                            <SyntaxHighlighter
                                              {...props}
                                              children={String(children).replace(/\n$/, '')}
                                              style={vscDarkPlus}
                                              language={match[1]}
                                              PreTag="div"
                                              className="rounded-md"
                                            />
                                          ) : (
                                            <code {...props} className={`${className || ''} bg-gray-150 text-red-500 px-1 py-0.5 rounded text-xs font-mono`}>
                                              {children}
                                            </code>
                                          )
                                        }
                                      }}
                                    >
                                      {post.text}
                                    </ReactMarkdown>
                                  </div>

                                  {post.codeSnippet && (
                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                      <span className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-wider">Mã nguồn ({post.codeLanguage || 'javascript'}):</span>
                                      <SyntaxHighlighter
                                        children={post.codeSnippet}
                                        style={vscDarkPlus}
                                        language={post.codeLanguage || 'javascript'}
                                        PreTag="div"
                                        className="rounded-lg shadow-sm overflow-hidden text-xs"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Post Interactions Footer */}
                                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-50 flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    {/* Like button */}
                                    <button
                                      onClick={() => handleLike(post._id)}
                                      className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                        isLiked 
                                          ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                                          : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      <ThumbsUp className={`w-3.5 h-3.5 mr-1.5 ${isLiked ? 'fill-indigo-600' : ''}`} />
                                      <span>{postLikesCount} Thích</span>
                                    </button>

                                    {/* Comments toggle button */}
                                    <button
                                      onClick={() => toggleComments(post._id)}
                                      className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                        expandedComments[post._id]
                                          ? 'text-indigo-600 bg-indigo-50'
                                          : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                      <span>{post.comments?.length || 0} Bình luận</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Comments Section (Expanded Inline) */}
                                {expandedComments[post._id] && (
                                  <div className="bg-gray-50 border-t border-gray-150 px-5 py-4">
                                    <CommentSection
                                      postId={post._id}
                                      post={post}
                                      comments={post.comments || []}
                                      onCommentsChange={(nextComments) => {
                                        setPosts((prevPosts) =>
                                          prevPosts.map((p) =>
                                            p._id === post._id ? { ...p, comments: nextComments } : p
                                          )
                                        );
                                      }}
                                    />
                                  </div>
                                )}

                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}

                  {/* TAB 2: PENDING POSTS FOR MODERATORS */}
                  {activeTab === 'pending' && canModerate && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                        Bài viết đang chờ duyệt ({pendingPosts.length})
                      </h3>

                      {pendingLoading ? (
                        <div className="text-center py-10">
                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Đang tải bài viết...</span>
                        </div>
                      ) : pendingPosts.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-150 p-10 text-center shadow-sm text-gray-500">
                          Không có bài viết nào đang chờ duyệt.
                        </div>
                      ) : (
                        pendingPosts.map((post) => {
                          const postDate = new Date(post.date).toLocaleDateString('vi-VN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div key={post._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                              <div className="p-5 flex items-center justify-between border-b border-gray-50">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 bg-indigo-50 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={post.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                                      alt={post.name} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-sm font-bold text-gray-900">{post.name || 'Thành viên'}</h4>
                                      {post.user?.reputation !== undefined && (
                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-3xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-3xs" title="Điểm uy tín">
                                          ★ {post.user.reputation}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400 block mt-0.5">{postDate}</span>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprovePost(post._id)}
                                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                  >
                                    Phê duyệt
                                  </button>
                                  <button
                                    onClick={() => handleRejectPost(post._id)}
                                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              </div>

                              <div className="p-5 space-y-3">
                                <div className="flex flex-wrap gap-1.5 mb-1">
                                  {post.isQuestion && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-150">
                                      <HelpCircle className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Câu hỏi chờ duyệt
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-800 text-sm leading-relaxed prose prose-slate prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                          <SyntaxHighlighter
                                            {...props}
                                            children={String(children).replace(/\n$/, '')}
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            className="rounded-md"
                                          />
                                        ) : (
                                          <code {...props} className={`${className || ''} bg-gray-150 text-red-500 px-1 py-0.5 rounded text-xs font-mono`}>
                                            {children}
                                          </code>
                                        )
                                      }
                                    }}
                                  >
                                    {post.text}
                                  </ReactMarkdown>
                                </div>
                                {post.codeSnippet && (
                                  <div className="mt-3 border-t border-gray-100 pt-3">
                                    <span className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-wider">Mã nguồn ({post.codeLanguage || 'javascript'}):</span>
                                    <SyntaxHighlighter
                                      children={post.codeSnippet}
                                      style={vscDarkPlus}
                                      language={post.codeLanguage || 'javascript'}
                                      PreTag="div"
                                      className="rounded-lg shadow-sm overflow-hidden text-xs"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* TAB 3: MEMBERS DETAILED VIEW (ONLY VISIBLE ON MOBILE IF ACTIVE, OR OPTIONAL ON DESKTOP) */}
                  {activeTab === 'members' && (
                    <div className="space-y-4 block md:hidden">
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                        Thành viên nhóm ({group.members?.length || 0})
                      </h3>
                      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                        {group.members?.map((m) => {
                          const memberUser = m.user;
                          if (!memberUser) return null;
                          const isMemberAdmin = group.admin?._id?.toString() === memberUser._id?.toString();
                          const isMemberMod = group.moderators && group.moderators.some(
                            (mod) => (mod._id || mod || '').toString() === memberUser._id?.toString()
                          );

                          return (
                            <div key={memberUser._id} className="flex items-center justify-between gap-2 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className="h-8 w-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                  <img 
                                    src={memberUser.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                                    alt={memberUser.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                                  />
                                </div>
                                <Link 
                                  to={`/profile/${memberUser._id}`} 
                                  className="text-xs font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate block"
                                >
                                  {memberUser.name}
                                </Link>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {isMemberAdmin && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-3xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
                                    Admin
                                  </span>
                                )}
                                {isMemberMod && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-3xs font-semibold bg-blue-600 text-white whitespace-nowrap">
                                    Mod
                                  </span>
                                )}
                                {isUserAdmin && !isMemberAdmin && (
                                  <button
                                    onClick={() => handleToggleModerator(memberUser._id)}
                                    className="text-3xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors font-bold"
                                  >
                                    {isMemberMod ? 'Bãi chức Mod' : 'Thăng chức Mod'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar Section (Members List - Desktop Only) */}
            <div className={`md:col-span-1 ${activeTab !== 'members' ? 'hidden md:block' : ''}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Thành viên ({group.members?.length || 0})</span>
                  <Users className="w-4 h-4 text-indigo-500" />
                </h3>
                
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {group.members?.map((m) => {
                    const memberUser = m.user;
                    if (!memberUser) return null;
                    const isMemberAdmin = group.admin?._id?.toString() === memberUser._id?.toString();
                    const isMemberMod = group.moderators && group.moderators.some(
                      (mod) => (mod._id || mod || '').toString() === memberUser._id?.toString()
                    );

                    return (
                      <div key={memberUser._id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                            <img 
                              src={memberUser.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                              alt={memberUser.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                            />
                          </div>
                          <Link 
                            to={`/profile/${memberUser._id}`} 
                            className="text-xs font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate block"
                          >
                            {memberUser.name}
                          </Link>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isMemberAdmin && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-3xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
                              Admin
                            </span>
                          )}
                          {isMemberMod && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-3xs font-semibold bg-blue-600 text-white whitespace-nowrap">
                              Mod
                            </span>
                          )}
                          {isUserAdmin && !isMemberAdmin && (
                            <button
                              onClick={() => handleToggleModerator(memberUser._id)}
                              className="text-3xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors font-bold"
                            >
                              {isMemberMod ? 'Bãi chức' : 'Thăng chức'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
