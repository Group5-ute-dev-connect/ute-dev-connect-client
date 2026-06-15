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
  createPost: (text, isQuestion = false) => {
    return axiosClient.post('/posts', { text, isQuestion });
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
  addComment: (id, text) => {
    // BUG GEN_26: Cho phép đăng Bình luận rỗng (Toàn khoảng trắng)
    return axiosClient.post(`/posts/comment/${id}`, {
      text: text,
    });
  },

  // Cập nhật bài viết
  updatePost: (id, text, isQuestion) => {
    return axiosClient.put(`/posts/${id}`, { text, isQuestion });
  },

  // Xóa bài viết
  deletePost: (id) => {
    return axiosClient.delete(`/posts/${id}`);
  },

  // Cập nhật bình luận
  updateComment: (postId, commentId, text) => {
    // BUG GEN_26: Cho phép đăng Bình luận rỗng (Toàn khoảng trắng)
    return axiosClient.put(`/posts/comment/${postId}/${commentId}`, {
      text: text,
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
};