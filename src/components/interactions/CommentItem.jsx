import React, { useState } from 'react';
import { User, CheckCircle, Loader2, Edit, Trash2, X, Save, ChevronUp, Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { postApi } from '../../services/api/postApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const formatDate = (date) => {
  if (!date) {
    return '';
  }

  try {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const CommentItem = ({ comment, post, onCommentsChange }) => {
  const { token } = useSelector((state) => state.auth);
  const currentUserId = token ? parseJwt(token)?.user?.id || parseJwt(token)?.id : null;
  const [isAccepting, setIsAccepting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentAuthorId = comment?.user?._id || comment?.user;
  const isCommentAuthor = currentUserId && commentAuthorId?.toString() === currentUserId?.toString();

  const name = comment?.name || comment?.user?.name || 'Người dùng ẩn danh';
  const avatar = comment?.avatar || comment?.user?.avatar || '';
  const text = comment?.text || '';
  const date = comment?.date || comment?.createdAt;
  const isAccepted = comment?.isAccepted;

  // Xử lý approvals (upvotes)
  const hasApproved = comment?.approvals && Array.isArray(comment.approvals) && comment.approvals.some(
    (app) => (app.user?._id || app.user || '').toString() === currentUserId?.toString()
  );
  const approvalsCount = comment?.approvals?.length || 0;

  // Xác định câu trả lời hữu ích nhất (nhiều vote nhất)
  const commentsArray = Array.isArray(post?.comments) ? post.comments : [];
  const maxApprovals = commentsArray.reduce((max, c) => {
    const count = c.approvals?.length || 0;
    return count > max ? count : max;
  }, 0);
  const isTopVoted = approvalsCount > 0 && approvalsCount === maxApprovals;

  const handleApprove = async () => {
    if (!token) {
      alert('Vui lòng đăng nhập để thực hiện phê duyệt.');
      return;
    }
    try {
      setIsApproving(true);
      const res = await postApi.approveComment(post._id, comment._id);
      if (res.data && res.data.data) {
        onCommentsChange?.(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể phê duyệt bình luận');
    } finally {
      setIsApproving(false);
    }
  };

  const handleAcceptAnswer = async () => {
    try {
      setIsAccepting(true);
      const res = await postApi.acceptAnswer(post._id, comment._id);
      if (res.data && res.data.data) {
        onCommentsChange?.(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật trạng thái câu trả lời');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await postApi.updateComment(post._id, comment._id, editText);
      if (res.data && res.data.data) {
        onCommentsChange?.(res.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Không thể cập nhật bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      setIsSubmitting(true);
      const res = await postApi.deleteComment(post._id, comment._id);
      if (res.data && res.data.data) {
        onCommentsChange?.(res.data.data);
      }
    } catch (err) {
      alert('Không thể xóa bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const postAuthorId = post?.user?._id || post?.user;
  const isPostAuthor = currentUserId && postAuthorId?.toString() === currentUserId?.toString();

  return (
    <div className={`flex gap-4 rounded-2xl border ${isAccepted ? 'border-green-300 bg-green-50 shadow-md' : isTopVoted ? 'border-amber-250 bg-amber-50/20 shadow-sm' : 'border-gray-100 bg-white shadow-sm'} p-4 transition-all duration-300 relative`}>
      {isAccepted && (
        <div className="absolute -top-3 -right-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center shadow-sm z-10">
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Câu trả lời được chấp nhận
        </div>
      )}
      {isTopVoted && !isAccepted && (
        <div className="absolute -top-3 -right-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center shadow-sm z-10">
          <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" /> Câu trả lời tốt nhất
        </div>
      )}

      {/* Cột upvote/approve bên trái */}
      <div className="flex flex-col items-center justify-start pt-1 gap-1 flex-shrink-0 w-8">
        <button 
          onClick={handleApprove}
          disabled={isApproving}
          className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors flex flex-col items-center justify-center ${hasApproved ? 'text-green-600 bg-green-50 font-bold' : 'text-gray-400'}`}
          title={hasApproved ? 'Bỏ phê duyệt' : 'Phê duyệt câu trả lời này'}
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </button>
        <span className="text-xs font-bold text-gray-700">{approvalsCount}</span>
        
        {isAccepted && (
          <CheckCircle className="w-5 h-5 text-green-600 mt-2 fill-green-50" title="Đã được tác giả bài viết chấp nhận" />
        )}
      </div>

      <div className="min-w-0 flex-1 flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-white shadow-sm mt-1">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
            />
          ) : (
            <User size={20} className="text-gray-500" />
          )}
        </div>

        <div className="min-w-0 flex-1 mt-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-gray-800">{name}</h4>
                {comment?.user?.reputation !== undefined && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-3xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-3xs" title="Điểm uy tín">
                    ★ {comment.user.reputation}
                  </span>
                )}
              </div>
              {date && (
                <span className="text-xs text-gray-400">{formatDate(date)}</span>
              )}
            </div>
            {isCommentAuthor && !isEditing && (
              <div className="flex items-center space-x-1">
                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors" title="Xóa bình luận">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full min-h-[80px] resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex gap-2 mt-2 justify-end">
                 <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                 <button onClick={handleEditSubmit} disabled={isSubmitting} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70">
                   {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                   Lưu
                 </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-2 text-sm leading-6 text-slate-800 prose prose-slate prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
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

              {comment?.codeSnippet && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <span className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-wider">Mã nguồn ({comment.codeLanguage || 'javascript'}):</span>
                  <SyntaxHighlighter
                    children={comment.codeSnippet}
                    style={vscDarkPlus}
                    language={comment.codeLanguage || 'javascript'}
                    PreTag="div"
                    className="rounded-lg shadow-sm overflow-hidden text-xs"
                  />
                </div>
              )}
            </>
          )}

          {post?.isQuestion && isPostAuthor && (
            <div className="mt-3 flex justify-end">
               <button 
                 onClick={handleAcceptAnswer}
                 disabled={isAccepting}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${isAccepted ? 'bg-white text-green-600 border-green-200 hover:bg-green-50' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-green-600'}`}
               >
                 {isAccepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className={`w-3.5 h-3.5 ${isAccepted ? 'text-green-500' : ''}`} />}
                 {isAccepted ? 'Bỏ chấp nhận' : 'Chấp nhận câu trả lời'}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;