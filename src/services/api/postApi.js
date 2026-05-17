import axiosClient from './axiosClient';

export const postApi = {
  createPost: (text) => {
    return axiosClient.post('/posts', { text });
  },
  getPostById: (id) => {
    return axiosClient.get(`/posts/${id}`);
  }
};
