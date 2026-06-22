import axiosClient from './axiosClient';

export const postApi = {
  // Lấy tất cả bài viết mới nhất (có phân trang)
  getAllPosts: (page = 1, limit = 5) => {
    return axiosClient.get(`/posts?page=${page}&limit=${limit}`);
  },

  // Lấy Top 10 bài viết nổi bật
  getTopTrending: () => {
    return axiosClient.get('/posts/top-trending');
  },

  // Tạo bài viết mới
  createPost: (text, isQuestion = false, groupId = null, codeSnippet = '', codeLanguage = 'javascript') => {
    return axiosClient.post('/posts', { text, isQuestion, groupId, codeSnippet, codeLanguage });
  },

  // Lấy bài viết theo ID
  getPostById: (id) => {
    return axiosClient.get(`/posts/${id}`);
  },

  // Lưu / bỏ lưu bài viết
  savePost: (id) => {
    return axiosClient.put(`/posts/save/${id}`);
  },

  // Lấy danh sách bài viết đã lưu
  getSavedPosts: () => {
    return axiosClient.get('/posts/saved');
  },

  // Like / Unlike bài viết
  likePost: (id) => {
    return axiosClient.put(`/posts/like/${id}`);
  },

  // Gửi bình luận
  addComment: (id, text, codeSnippet = '', codeLanguage = 'javascript') => {
    return axiosClient.post(`/posts/comment/${id}`, {
      text: text.trim(),
      codeSnippet,
      codeLanguage,
    });
  },

  // Cập nhật bài viết
  updatePost: (id, text, isQuestion, codeSnippet = '', codeLanguage = 'javascript') => {
    return axiosClient.put(`/posts/${id}`, { text, isQuestion, codeSnippet, codeLanguage });
  },

  // Xóa bài viết
  deletePost: (id) => {
    return axiosClient.delete(`/posts/${id}`);
  },

  // Cập nhật bình luận
  updateComment: (postId, commentId, text) => {
    return axiosClient.put(`/posts/comment/${postId}/${commentId}`, {
      text: text.trim(),
    });
  },

  // Xóa bình luận
  deleteComment: (postId, commentId) => {
    return axiosClient.delete(`/posts/comment/${postId}/${commentId}`);
  },

  // Chấp nhận câu trả lời
  acceptAnswer: (postId, commentId) => {
    return axiosClient.put(`/posts/accept/${postId}/${commentId}`);
  },

  // Phê duyệt bình luận (Upvote)
  approveComment: (postId, commentId) => {
    return axiosClient.put(`/posts/comment/${postId}/${commentId}/approve`);
  },
};