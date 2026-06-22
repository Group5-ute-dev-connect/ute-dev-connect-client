import React from 'react';
import CommentSection from './CommentSection';

const PostInteractions = ({ post, setPost }) => {
  if (!post?._id) {
    return null;
  }

  const comments = Array.isArray(post.comments) ? post.comments : [];

  const handleCommentsChange = (nextComments) => {
    setPost((previousPost) => ({
      ...previousPost,
      comments: nextComments,
    }));
  };

  return (
    <div className="mt-6">
      <CommentSection
        postId={post._id}
        post={post}
        comments={comments}
        onCommentsChange={handleCommentsChange}
      />
    </div>
  );
};

export default PostInteractions;