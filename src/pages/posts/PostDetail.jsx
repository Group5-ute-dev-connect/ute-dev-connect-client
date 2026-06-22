import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postApi } from '../../services/api/postApi';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { ArrowLeft } from 'lucide-react';
import PostItem from '../../components/posts/PostItem';
import PostInteractions from '../../components/interactions/PostInteractions';

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

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

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

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
      <Link to="/dashboard" className="inline-flex items-center mb-6 text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
      </Link>
      
      <PostItem post={post} isDetail={true} onPostUpdate={handlePostUpdate} />
      <PostInteractions post={post} setPost={setPost} />
    </div>
  );
};

export default PostDetail;
