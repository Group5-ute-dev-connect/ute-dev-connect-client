import axiosClient from './axiosClient';

const adminApi = {
  getStats: () => {
    return axiosClient.get('/admin/stats');
  },
  getUsers: () => {
    return axiosClient.get('/admin/users');
  },
  deleteUser: (id) => {
    return axiosClient.delete(`/admin/users/${id}`);
  },
  getPosts: () => {
    return axiosClient.get('/admin/posts');
  },
  deletePost: (id) => {
    return axiosClient.delete(`/admin/posts/${id}`);
  }
};

export default adminApi;
