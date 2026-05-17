import axiosClient from './axiosClient';

export const postApi = {
  // Lấy tất cả bài viết mới nhất
  getAllPosts: () => {
    return axiosClient.get('/posts');
  },

  // Tạo bài viết mới
  createPost: (text) => {
    return axiosClient.post('/posts', { text });
  },

  // Lấy bài viết theo ID
  getPostById: (id) => {
    return axiosClient.get(`/posts/${id}`);
  },

  // Tài: Like / Unlike bài viết
  likePost: (id) => {
    return axiosClient.put(`/posts/like/${id}`);
  },

  // Tài: Gửi bình luận
  addComment: (id, text) => {
    return axiosClient.post(`/posts/comment/${id}`, {
      text: text.trim(),
    });
  },
};