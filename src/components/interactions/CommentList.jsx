import React from 'react';
import { MessageCircle } from 'lucide-react';
import CommentItem from './CommentItem';

const CommentList = ({ comments = [] }) => {
  if (!comments.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <MessageCircle size={28} className="mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {comments.map((comment, index) => (
        <CommentItem
          key={comment._id || comment.id || `${comment.text}-${index}`}
          comment={comment}
        />
      ))}
    </div>
  );
};

export default CommentList;