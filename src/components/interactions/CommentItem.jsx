import React from 'react';
import { User } from 'lucide-react';

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

const CommentItem = ({ comment }) => {
  const name = comment?.name || comment?.user?.name || 'Người dùng ẩn danh';
  const avatar = comment?.avatar || comment?.user?.avatar || '';
  const text = comment?.text || '';
  const date = comment?.date || comment?.createdAt;

  return (
    <div className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <User size={20} className="text-gray-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="font-semibold text-gray-800">{name}</h4>

          {date && (
            <span className="text-xs text-gray-400">{formatDate(date)}</span>
          )}
        </div>

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
          {text}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;