import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User, Calendar, MessageSquare, ThumbsUp, Tag, Bookmark, HelpCircle, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { savePost, deletePost, updatePost } from '../../store/postSlice';
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
const PostItem = ({ post }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  const parseJwt = (t) => { try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; } };
  
  const { _id, text, name, avatar, user, likes, comments, tags, date, isSaved, isQuestion, acceptedAnswer } = post || {};
  
  const currentUserId = token ? parseJwt(token)?.user?.id || parseJwt(token)?.id : null;
  const authorId = user?._id || user;
  const authorReputation = typeof user === 'object' ? user?.reputation : undefined;
  const isPostAuthor = currentUserId && authorId?.toString() === currentUserId?.toString();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editIsQuestion, setEditIsQuestion] = useState(isQuestion || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSavePost = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(savePost(_id));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setIsSubmitting(true);
    await dispatch(updatePost({ id: _id, formData: { text: editText, isQuestion: editIsQuestion } }));
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      dispatch(deletePost(_id));
    }
  };
  // Format ngày tháng theo tiếng Việt
  const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
            {/* Ngày đăng */}
            <div className="flex items-center text-xs text-gray-400 mt-0.5">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          {isPostAuthor && !isEditing && (
            <div className="flex items-center space-x-1">
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
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 w-fit">
                <input type="checkbox" checked={editIsQuestion} onChange={(e) => setEditIsQuestion(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                Đây là một câu hỏi?
              </label>
              <div className="flex gap-2 self-end">
                 <button onClick={(e) => { e.preventDefault(); setIsEditing(false); }} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                 <button onClick={handleEditSubmit} disabled={isSubmitting} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70">
                   {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to={`/post/${_id}`} className="block">
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
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-400 text-xs">
            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium text-gray-600">
              {likes?.length || 0}
            </span>
          </div>

          <div className="flex items-center text-gray-400 text-xs">
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium text-gray-600">
              {comments?.length || 0}
            </span>
          </div>
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

          <Link
            to={`/post/${_id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            Xem thêm →
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PostItem;
