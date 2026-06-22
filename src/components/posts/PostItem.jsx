import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { User, Calendar, MessageSquare, ThumbsUp, Tag, Bookmark, HelpCircle, CheckCircle, Edit2, Trash2, Eye, EyeOff, Globe, Lock, Users, UserCheck } from 'lucide-react';
import { savePost, deletePost, updatePost, hidePost, likePost } from '../../store/postSlice';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * PostItem - Component thẻ bài viết thu gọn
 * Hiển thị: Avatar, tên tác giả, nội dung ngắn, ngày đăng, số likes/comments
 * Tham khảo từ devconnector_2.0/client/src/components/posts/PostItem.js
 */
const PostItem = ({ post, isDetail = false, onPostUpdate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const parseJwt = (t) => { try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; } };
  
  const { _id, text, name, avatar, user, likes, comments, tags, date, isSaved, isQuestion, acceptedAnswer, visibility, isHidden } = post || {};
  
  const currentUserId = token ? parseJwt(token)?.user?.id || parseJwt(token)?.id : null;
  const isLiked = Array.isArray(likes) && currentUserId && likes.some(like => {
    const likeUserId = like?.user?._id || like?.user || like?._id || like;
    return likeUserId?.toString() === currentUserId?.toString();
  });
  const authorId = user?._id || user;
  const authorReputation = typeof user === 'object' ? user?.reputation : undefined;
  const isPostAuthor = currentUserId && authorId?.toString() === currentUserId?.toString();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editIsQuestion, setEditIsQuestion] = useState(isQuestion || false);
  const [editVisibility, setEditVisibility] = useState(visibility || 'public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getVisibilityIcon = (vis) => {
    switch (vis) {
      case 'personal':
        return <Lock className="w-3 h-3 text-gray-555" />;
      case 'followers':
        return <Users className="w-3 h-3 text-blue-500" />;
      case 'friends':
        return <UserCheck className="w-3 h-3 text-green-500" />;
      case 'public':
      default:
        return <Globe className="w-3 h-3 text-gray-400" />;
    }
  };

  const getVisibilityText = (vis) => {
    switch (vis) {
      case 'personal':
        return 'Chỉ mình tôi';
      case 'followers':
        return 'Người theo dõi';
      case 'friends':
        return 'Bạn bè';
      case 'public':
      default:
        return 'Công khai';
    }
  };

  const getVisibilityTitle = (vis) => {
    switch (vis) {
      case 'personal':
        return 'Chế độ: Chỉ mình tôi';
      case 'followers':
        return 'Chế độ: Người theo dõi';
      case 'friends':
        return 'Chế độ: Bạn bè (Theo dõi chéo)';
      case 'public':
      default:
        return 'Chế độ: Công khai';
    }
  };

  const handleHideToggle = async (e) => {
    e.preventDefault();
    const actionWord = isHidden ? 'hiện lại' : 'ẩn';
    const confirmed = window.confirm(`Bạn có chắc chắn muốn ${actionWord} bài viết này?`);
    if (!confirmed) return;

    try {
      const resultAction = await dispatch(hidePost(_id));
      if (hidePost.fulfilled.match(resultAction)) {
        const nextIsHidden = resultAction.payload.isHidden;
        
        if (isDetail && nextIsHidden) {
          navigate('/dashboard');
        }
        
        const ToastWithUndo = ({ closeToast }) => (
          <div className="flex items-center justify-between gap-2 w-full">
            <span>{nextIsHidden ? 'Đã ẩn bài viết khỏi bảng tin.' : 'Đã hiện lại bài viết.'}</span>
            <button 
              onClick={async (event) => {
                event.stopPropagation();
                await dispatch(hidePost(_id));
                closeToast();
                toast.success(nextIsHidden ? 'Đã hiện lại bài viết!' : 'Đã ẩn bài viết!');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer pl-2 whitespace-nowrap"
            >
              Hoàn tác
            </button>
          </div>
        );
        toast.info(<ToastWithUndo />, { autoClose: 5000 });
      } else {
        toast.error(resultAction.payload || `Không thể ${actionWord} bài viết`);
      }
    } catch (err) {
      toast.error(`Lỗi khi ${actionWord} bài viết`);
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      const confirmed = window.confirm('Bạn có chắc chắn muốn bỏ lưu bài viết này?');
      if (!confirmed) return;

      try {
        const resultAction = await dispatch(savePost(_id));
        if (savePost.fulfilled.match(resultAction)) {
          const ToastWithRedo = ({ closeToast }) => (
            <div className="flex items-center justify-between gap-2 w-full">
              <span>Đã bỏ lưu bài viết.</span>
              <button 
                onClick={async (event) => {
                  event.stopPropagation();
                  await dispatch(savePost(_id));
                  closeToast();
                  toast.success('Đã lưu lại bài viết!');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer pl-2 whitespace-nowrap"
              >
                Lưu lại
              </button>
            </div>
          );
          toast.info(<ToastWithRedo />, { autoClose: 5000 });
        } else {
          toast.error(resultAction.payload || 'Không thể bỏ lưu bài viết');
        }
      } catch (err) {
        toast.error('Lỗi khi bỏ lưu bài viết');
      }
    } else {
      try {
        const resultAction = await dispatch(savePost(_id));
        if (savePost.fulfilled.match(resultAction)) {
          toast.success('Đã lưu bài viết thành công!');
        } else {
          toast.error(resultAction.payload || 'Không thể lưu bài viết');
        }
      } catch (err) {
        toast.error('Lỗi khi lưu bài viết');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(updatePost({ id: _id, formData: { text: editText, isQuestion: editIsQuestion, visibility: editVisibility } }));
      if (updatePost.fulfilled.match(resultAction)) {
        toast.success('Cập nhật bài viết thành công!');
        onPostUpdate?.(resultAction.payload);
      } else {
        toast.error(resultAction.payload || 'Không thể cập nhật bài viết');
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật bài viết');
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        const resultAction = await dispatch(deletePost(_id));
        if (deletePost.fulfilled.match(resultAction)) {
          toast.success('Xóa bài viết thành công!');
          if (isDetail) {
            navigate('/dashboard');
          }
        } else {
          toast.error(resultAction.payload || 'Không thể xóa bài viết');
        }
      } catch (err) {
        toast.error('Lỗi khi xóa bài viết');
      }
    }
  };

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) {
      toast.error('Bạn cần đăng nhập để thực hiện chức năng này!');
      return;
    }
    try {
      const resultAction = await dispatch(likePost(_id));
      if (likePost.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload.liked) {
          toast.success('Đã thích bài viết!');
        } else {
          toast.success('Đã bỏ thích bài viết!');
        }
        if (onPostUpdate && payload.likes) {
          onPostUpdate({
            ...post,
            likes: payload.likes
          });
        }
      } else {
        toast.error(resultAction.payload || 'Không thể thực hiện thích bài viết');
      }
    } catch (err) {
      toast.error('Lỗi khi thích bài viết');
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDetail) {
      const commentInput = document.getElementById('comment') || document.querySelector('.comment-form textarea');
      if (commentInput) {
        commentInput.focus();
        commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      navigate(`/post/${_id}?focusComment=true`);
    }
  };

  // Format ngày tháng theo tiếng Việt
  const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const postBodyContent = (
    <>
      <div className="mb-2">
         {isQuestion && (
           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
             <HelpCircle className="w-3 h-3 mr-1" /> Câu hỏi
           </span>
         )}
         {isQuestion && acceptedAnswer && (
           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
             <CheckCircle className="w-3 h-3 mr-1" /> Đã giải quyết
           </span>
         )}
      </div>
      <div className="text-slate-800 text-sm leading-relaxed mb-3 hover:text-gray-900 transition-colors">
        <div className="prose prose-slate prose-sm text-slate-800 max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
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
                  <code {...props} className={`${className || ''} bg-gray-100 text-red-500 px-1 py-0.5 rounded text-xs font-mono`}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-5">
        {/* Header: Avatar + Tên + Ngày */}
        <div className="flex items-center space-x-3 mb-3">
          {/* Avatar */}
          <Link 
            to={`/profile/${authorId}`} 
            className="flex-shrink-0"
          >
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-blue-200 transition-all duration-300">
                <img 
                  src={avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                  alt={name} 
                  className="h-11 w-11 rounded-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
                />
            </div>
          </Link>
          
          <div className="flex-1 min-w-0">
            {/* Tên tác giả */}
            <div className="flex items-center gap-1.5 truncate">
              <Link 
                to={`/profile/${authorId}`} 
                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block"
              >
                {name || 'Người dùng ẩn danh'}
              </Link>
              {authorReputation !== undefined && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-3xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-3xs" title="Điểm uy tín">
                  ★ {authorReputation}
                </span>
              )}
            </div>
            {/* Ngày đăng & Quyền riêng tư */}
            <div className="flex items-center text-xs text-gray-400 mt-0.5 gap-2">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formattedDate}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1" title={getVisibilityTitle(visibility)}>
                {getVisibilityIcon(visibility)}
                <span>{getVisibilityText(visibility)}</span>
              </span>
            </div>
          </div>
          {isPostAuthor && !isEditing && (
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleHideToggle} 
                className="text-gray-400 hover:text-indigo-500 p-1.5 rounded-full hover:bg-indigo-50 transition-colors" 
                title={isHidden ? "Hiện lại bài viết" : "Ẩn bài viết"}
              >
                {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={(e) => { e.preventDefault(); setIsEditing(true); }} className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50 transition-colors" title="Chỉnh sửa bài viết">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors" title="Xóa bài viết">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Nội dung ngắn */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full min-h-[100px] resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <input type="checkbox" checked={editIsQuestion} onChange={(e) => setEditIsQuestion(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  Câu hỏi
                </label>
                <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-555 pl-1">Hiển thị:</span>
                  <select
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value)}
                    className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="public">🌐 Công khai</option>
                    <option value="personal">🔒 Chỉ mình tôi</option>
                    <option value="followers">👥 Người theo dõi</option>
                    <option value="friends">🤝 Bạn bè</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 self-end">
                 <button onClick={(e) => { e.preventDefault(); setIsEditing(false); }} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                 <button onClick={handleEditSubmit} disabled={isSubmitting} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70">
                   {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                 </button>
              </div>
            </div>
          </div>
        ) : isDetail ? (
          <div className="block">
            {postBodyContent}
          </div>
        ) : (
          <Link to={`/post/${_id}`} className="block">
            {postBodyContent}
          </Link>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

       {/* Footer: Likes + Comments + Bookmark */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-555">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleLikeToggle}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isLiked
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 transition-transform duration-200 active:scale-125 ${
                isLiked ? 'fill-blue-500 text-blue-500' : ''
              }`}
            />
            <span className="font-medium text-gray-600">
              {likes?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCommentClick}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-medium text-gray-600">
              {comments?.length || 0}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSavePost}
            className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isSaved
                ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-500 hover:text-yellow-700 hover:bg-yellow-50'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isSaved ? 'fill-yellow-500 text-yellow-500' : ''
              }`}
            />
            {isSaved ? 'Đã lưu' : 'Lưu'}
          </button>

          {!isDetail && (
            <Link
              to={`/post/${_id}`}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              Xem thêm →
            </Link>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PostItem;
