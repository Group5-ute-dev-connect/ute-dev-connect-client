import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { postApi } from '../../services/api/postApi';

const getDataFromResponse = (response) => {
  return response?.data?.data || response?.data || response;
};

const CommentForm = ({ postId, onCommentCreated }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedText = text.trim();

    if (!normalizedText) {
      setError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await postApi.addComment(postId, normalizedText);
      const data = getDataFromResponse(response);

      onCommentCreated?.(data);
      setText('');
    } catch (err) {
      console.error('Lỗi khi gửi bình luận:', err);

      setError(
        err.response?.data?.message ||
          'Không thể gửi bình luận. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label
        htmlFor="comment"
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        Viết bình luận
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <textarea
          id="comment"
          value={text}
          onChange={(event) => {
            setText(event.target.value);

            if (error) {
              setError('');
            }
          }}
          rows={3}
          placeholder="Nhập bình luận của bạn..."
          className={`min-h-[90px] flex-1 resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            error ? 'border-red-400' : 'border-gray-200'
          }`}
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          Gửi
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
};

export default CommentForm;