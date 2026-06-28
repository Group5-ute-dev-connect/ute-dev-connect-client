import axiosClient from './axiosClient';

export const adminApi = {
  getSystemStats: (params = {}) => {
    return axiosClient.get('/admin/stats', { params });
  }
};

export default adminApi;
