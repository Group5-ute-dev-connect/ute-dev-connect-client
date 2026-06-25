import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { postApi } from '../../services/api/postApi';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { ArrowLeft, User, Calendar, MessageSquare, HelpCircle, CheckCircle, Trash2 } from 'lucide-react';
import PostInteractions from '../../components/interactions/PostInteractions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const parseJwt = (t) => { try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; } };

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postApi.getPostById(id);
        // Tùy theo cấu hình axios interceptor mà response có thể nằm ở response.data hoặc data
        const postData = response.data?.data || response.data || response;
        setPost(postData);
        setError('');
      } catch (err) {
        console.error('Lỗi khi tải bài viết:', err);
        const errorMsg = err.response?.data?.message || 'Không thể tải bài viết. Vui lòng thử lại sau.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-4">
        <Alert type="error" message={error} />
        <Link to="/dashboard" className="inline-flex items-center mt-4 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const currentUserId = token ? parseJwt(token)?.user?.id || parseJwt(token)?.id : null;
  const isPostAuthor = currentUserId && post.user === currentUserId;

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await postApi.deletePost(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Lỗi khi xóa bài viết:', err);
      setError('Không thể xóa bài viết này.');
    }
  };

  const formattedDate = new Date(post.date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
     <Link to="/dashboard" className="inline-flex items-center mb-6 text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
      </Link>
      
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header bài viết */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
              <img 
                src={post.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                alt={post.name} 
                className="h-12 w-12 rounded-full object-cover" 
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{post.name || 'Người dùng ẩn danh'}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
            {isPostAuthor && (
              <button
                onClick={handleDelete}
                className="ml-auto text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Xóa bài viết"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Nội dung bài viết */}
        <div className="p-6">
          <div className="mb-4">
             {post.isQuestion && (
               <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-indigo-100 text-indigo-800 mr-2">
                 <HelpCircle className="w-4 h-4 mr-1.5" /> Câu hỏi
               </span>
             )}
             {post.isQuestion && post.acceptedAnswer && (
               <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800 mr-2">
                 <CheckCircle className="w-4 h-4 mr-1.5" /> Đã giải quyết
               </span>
             )}
          </div>
          <div className="text-slate-800 leading-relaxed max-w-none prose prose-slate prose-p:my-2 prose-pre:my-4 prose-headings:my-4 prose-ul:my-2 prose-ol:my-2">
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
                    <code {...props} className={`${className} bg-gray-100 text-red-500 px-1.5 py-0.5 rounded text-sm font-mono`}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {post.text}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* Footer bài viết (Thống kê) */}
        <div className="px-6 py-4 bg-gray-50 flex items-center text-gray-500 text-sm">
          <div className="flex items-center mr-6">
            <span className="font-semibold text-gray-700 mr-1">{post.likes?.length || 0}</span> lượt thích
          </div>
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span className="font-semibold text-gray-700 mr-1">{post.comments?.length || 0}</span> bình luận
          </div>
        </div>
      </article>
      <PostInteractions post={post} setPost={setPost} />
    </div>
  );
};

export default PostDetail;
