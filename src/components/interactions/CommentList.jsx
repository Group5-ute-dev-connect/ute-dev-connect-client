import React from 'react';
import { MessageCircle } from 'lucide-react';
import CommentItem from './CommentItem';

const CommentList = ({ post, comments = [], onCommentsChange }) => {
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

  const sortedComments = [...comments].sort((a, b) => {
    // 1. Câu trả lời được chấp nhận (isAccepted) lên đầu
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;

    // 2. Tiếp theo sắp xếp theo số lượt duyệt (approvals) giảm dần
    const aApprovals = a.approvals?.length || 0;
    const bApprovals = b.approvals?.length || 0;
    return bApprovals - aApprovals;
  });

  return (
    <div className="mt-4 space-y-3">
      {sortedComments.map((comment, index) => (
        <CommentItem
          key={comment._id || comment.id || `${comment.text}-${index}`}
          comment={comment}
          post={post}
          onCommentsChange={onCommentsChange}
        />
      ))}
    </div>
  );
};

export default CommentList;