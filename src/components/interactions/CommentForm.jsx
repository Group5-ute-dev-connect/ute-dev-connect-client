import React, { useState } from 'react';
import { Loader2, Send, Edit2, Eye } from 'lucide-react';
import { postApi } from '../../services/api/postApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const getDataFromResponse = (response) => {
  return response?.data?.data || response?.data || response;
};

const CommentForm = ({ postId, onCommentCreated }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

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
      setIsPreview(false);
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
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="comment"
          className="block text-sm font-semibold text-gray-700"
        >
          Viết bình luận
        </label>
        <div className="flex space-x-2">
          <button type="button" onClick={() => setIsPreview(false)} className={`px-2 py-1 text-xs font-medium rounded-md flex items-center transition-colors ${!isPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Edit2 className="w-3.5 h-3.5 mr-1" /> Viết
          </button>
          <button type="button" onClick={() => setIsPreview(true)} className={`px-2 py-1 text-xs font-medium rounded-md flex items-center transition-colors ${isPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Eye className="w-3.5 h-3.5 mr-1" /> Xem trước
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 w-full min-w-0">
          {!isPreview ? (
            <textarea
              id="comment"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="Nhập bình luận của bạn (Hỗ trợ Markdown)..."
              className={`w-full min-h-[90px] resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                error ? 'border-red-400' : 'border-gray-200'
              }`}
            />
          ) : (
            <div className="w-full min-h-[90px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 prose prose-slate prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 sm:h-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 shrink-0"
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