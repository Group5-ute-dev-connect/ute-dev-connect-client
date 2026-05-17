import React from 'react';
import { MessageCircle } from 'lucide-react';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

const PostInteractions = ({ post, setPost }) => {
  if (!post?._id) {
    return null;
  }

  const likes = Array.isArray(post.likes) ? post.likes : [];
  const comments = Array.isArray(post.comments) ? post.comments : [];

  const handleLikesChange = (nextLikes) => {
    setPost((previousPost) => ({
      ...previousPost,
      likes: nextLikes,
    }));
  };

  const handleCommentsChange = (nextComments) => {
    setPost((previousPost) => ({
      ...previousPost,
      comments: nextComments,
    }));
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <LikeButton
          postId={post._id}
          likes={likes}
          onLikesChange={handleLikesChange}
        />

        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
          <MessageCircle size={18} />
          <span>{comments.length} bình luận</span>
        </div>
      </div>

      <CommentSection
        postId={post._id}
        comments={comments}
        onCommentsChange={handleCommentsChange}
      />
    </div>
  );
};

export default PostInteractions;