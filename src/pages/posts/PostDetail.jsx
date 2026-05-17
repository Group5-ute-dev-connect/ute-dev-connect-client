import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postApi } from '../../services/api/postApi';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { ArrowLeft, User, Calendar, MessageSquare } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
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
        <Link to="/" className="inline-flex items-center mt-4 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const formattedDate = new Date(post.date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
      <Link to="/" className="inline-flex items-center mb-6 text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
      </Link>
      
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header bài viết */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
              {post.avatar ? (
                <img src={post.avatar} alt={post.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{post.name || 'Người dùng ẩn danh'}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung bài viết */}
        <div className="p-6">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.text}</p>
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
    </div>
  );
};

export default PostDetail;
