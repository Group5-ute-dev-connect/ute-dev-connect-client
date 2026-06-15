import React, { useState } from 'react';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { postApi } from '../../services/api/postApi';
import { MessageSquarePlus, HelpCircle, Eye, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const PostForm = () => {
  const [text, setText] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    // BUG GEN_31: Cho phép gửi Bài viết trống lên bảng tin chung (Toàn khoảng trắng)
    if (!text) {
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
      const response = await postApi.createPost(text, isQuestion);
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          {isQuestion ? (
             <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" />
          ) : (
             <MessageSquarePlus className="w-5 h-5 mr-2 text-blue-600" />
          )}
          {isQuestion ? 'Tạo câu hỏi' : 'Tạo bài viết mới'}
        </h3>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={isQuestion} onChange={() => setIsQuestion(!isQuestion)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isQuestion ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isQuestion ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm font-medium text-gray-700">Đây là một câu hỏi?</div>
        </label>
      </div>
      
      {apiSuccess && <Alert type="success" message={apiSuccess} />}
      {apiError && <Alert type="error" message={apiError} />}
      
      <div className="flex space-x-2 mb-2 border-b border-gray-100 pb-2">
        <button type="button" onClick={() => setIsPreview(false)} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${!isPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Edit2 className="w-4 h-4 mr-1.5" /> Viết
        </button>
        <button type="button" onClick={() => setIsPreview(true)} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${isPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Eye className="w-4 h-4 mr-1.5" /> Xem trước
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-2">
        {!isPreview ? (
          <Textarea
            placeholder={isQuestion ? "Bạn đang gặp vấn đề gì? Hãy miêu tả chi tiết, bạn có thể dùng Markdown để format code..." : "Bạn đang nghĩ gì? Có thể dùng Markdown..."}
            value={text}
            onChange={handleChange}
            error={error}
            rows={5}
            // BUG GEN_13: Tắt giới hạn độ dài ký tự tối đa của bài viết (Max Limit)
            maxLength={100000000}
          />
        ) : (
          <div className="p-4 border rounded-md bg-gray-50 min-h-[136px] max-w-none text-sm text-slate-800 prose prose-slate prose-sm prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
            {text ? (
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
                      <code {...props} className={`${className} bg-gray-100 text-red-500 px-1 py-0.5 rounded text-xs font-mono`}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {text}
              </ReactMarkdown>
            ) : (
              <span className="text-gray-400 italic">Chưa có nội dung để xem trước...</span>
            )}
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-500 hidden sm:block">Hỗ trợ Markdown (ví dụ: `code`, **đậm**)</div>
          <Button type="submit" isLoading={isLoading} className={isQuestion ? 'bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto px-6' : 'w-full sm:w-auto px-6'}>
            {isQuestion ? 'Đăng câu hỏi' : 'Đăng bài'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
