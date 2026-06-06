import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import groupApi from '../../services/api/groupApi';
import { postApi } from '../../services/api/postApi';
import { 
  Users, ArrowLeft, Loader2, MessageSquare, ThumbsUp, 
  Send, Shield, Calendar, SendHorizontal, AlertCircle, LogOut, Lock
} from 'lucide-react';

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
  const [commentTexts, setCommentTexts] = useState({}); // { [postId]: string }
  const [submittingComment, setSubmittingComment] = useState({}); // { [postId]: boolean }

  // Tabs on Mobile
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'members'

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

      // If member/admin, fetch internal feed
      if (groupData && (isMember || isAdmin)) {
        await fetchFeed();
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
      const response = await groupApi.createGroupPost(id, newPostText.trim());
      if (response.success || response.data) {
        toast.success('Đăng bài thành công!');
        setNewPostText('');
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

  // Handle Comment Submit
  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = commentTexts[postId] || '';
    if (!commentText.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await groupApi.addGroupComment(id, postId, commentText.trim());
      const comments = response.data?.data || response.data || [];
      
      // Update local posts state with new comments
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: comments
            };
          }
          return post;
        })
      );

      // Clear input
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      toast.success('Đã gửi bình luận');
    } catch (err) {
      console.error('Lỗi khi gửi bình luận:', err);
      toast.error('Bình luận thất bại.');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentTexts(prev => ({ ...prev, [postId]: text }));
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

  // Format Date
  const formattedDate = new Date(group.date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
              {/* Absolutes styling if needed */}
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

          {/* Mobile Tabs */}
          <div className="flex md:hidden bg-white p-1 rounded-xl border border-gray-100 shadow-sm mb-6">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'feed' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
              }`}
            >
              Bảng tin
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'members' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
              }`}
            >
              Thành viên ({group.members?.length || 0})
            </button>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feed Section */}
            <div className={`md:col-span-2 ${activeTab !== 'feed' ? 'hidden md:block' : ''}`}>
              
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
                  {/* Create Post Form */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                      Đăng bài viết mới
                    </h3>
                    <form onSubmit={handleCreatePost}>
                      <textarea
                        placeholder="Thảo luận code, tài liệu môn học, tìm thành viên..."
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        rows={3}
                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
                      />
                      <div className="flex justify-end mt-3">
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
                          Đăng bài
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
                                <h4 className="text-sm font-bold text-gray-900">{post.name || 'Thành viên'}</h4>
                                <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                  <Calendar className="w-3.5 h-3.5 mr-1" />
                                  <span>{postDate}</span>
                                </div>
                              </div>
                            </div>

                            {/* Post Body */}
                            <div className="p-5">
                              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {post.text}
                              </p>
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
                              <div className="bg-gray-50 border-t border-gray-100 p-5 space-y-4">
                                
                                {/* Comments List */}
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                  {post.comments?.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center py-2">
                                      Chưa có bình luận nào. Hãy gửi phản hồi đầu tiên!
                                    </p>
                                  ) : (
                                    post.comments.map((comment) => {
                                      const commentDate = new Date(comment.date).toLocaleDateString('vi-VN', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      });
                                      return (
                                        <div key={comment._id} className="flex items-start space-x-2.5">
                                          <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                             <img 
                                               src={comment.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                                               alt={comment.name} 
                                               className="w-full h-full object-cover" 
                                               onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                                             />
                                          </div>
                                          <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100 text-xs">
                                            <div className="flex items-center justify-between mb-1">
                                              <strong className="font-bold text-gray-900">{comment.name}</strong>
                                              <span className="text-3xs text-gray-400">{commentDate}</span>
                                            </div>
                                            <p className="text-gray-700 leading-normal whitespace-pre-wrap">
                                              {comment.text}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* Write Comment Form */}
                                <form 
                                  onSubmit={(e) => handleCommentSubmit(e, post._id)}
                                  className="flex items-center gap-2 pt-2 border-t border-gray-100"
                                >
                                  <input
                                    type="text"
                                    placeholder="Viết bình luận..."
                                    value={commentTexts[post._id] || ''}
                                    onChange={(e) => handleCommentTextChange(post._id, e.target.value)}
                                    className="flex-grow px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                  />
                                  <button
                                    type="submit"
                                    disabled={submittingComment[post._id] || !(commentTexts[post._id] || '').trim()}
                                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                                  >
                                    {submittingComment[post._id] ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Send className="w-4 h-4" />
                                    )}
                                  </button>
                                </form>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar Section (Members List) */}
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

                        {isMemberAdmin && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-3xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
                            Admin
                          </span>
                        )}
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
