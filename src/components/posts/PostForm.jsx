import React, { useState } from 'react';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { postApi } from '../../services/api/postApi';
import { MessageSquarePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostForm = () => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!text.trim()) {
      setError('Nội dung không được để trống.');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (error) setError('');
    if (apiError) setApiError('');
    if (apiSuccess) setApiSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await postApi.createPost(text);
      if (response.success || response.status === 201 || (response.data && response.data.success)) {
        setApiSuccess('Đăng bài thành công!');
        setText('');
        
        // Chuyển hướng đến trang chi tiết bài viết (nếu cần)
        const newPostId = response.data?._id || (response.data?.data?._id);
        if (newPostId) {
          setTimeout(() => {
            navigate(`/post/${newPostId}`);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tạo bài viết:', err);
      // Lấy message lỗi từ response nếu có
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Đã có lỗi xảy ra khi đăng bài.';
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <MessageSquarePlus className="w-5 h-5 mr-2 text-blue-600" />
        Tạo bài viết mới
      </h3>
      
      {apiSuccess && <Alert type="success" message={apiSuccess} />}
      {apiError && <Alert type="error" message={apiError} />}
      
      <form onSubmit={handleSubmit} className="mt-4">
        <Textarea
          placeholder="Bạn đang nghĩ gì?"
          value={text}
          onChange={handleChange}
          error={error}
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <Button type="submit" isLoading={isLoading}>
            Đăng bài
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
