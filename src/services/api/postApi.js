import axiosClient from './axiosClient';

export const postApi = {
  // Lấy tất cả bài viết mới nhất (có phân trang)
  getAllPosts: (page = 1, limit = 5) => {
    return axiosClient.get(`/posts?page=${page}&limit=${limit}`);
  },
  // Tạo bài viết mới
  createPost: (text) => {
    return axiosClient.post('/posts', { text });
  },
  // Lấy bài viết theo ID
  getPostById: (id) => {
    return axiosClient.get(`/posts/${id}`);
  }
};
