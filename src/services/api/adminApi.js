import axiosClient from './axiosClient';

export const adminApi = {
  getSystemStats: (params = {}) => {
    return axiosClient.get('/admin/stats', { params });
  },
  getSystemLogs: (params = {}) => {
    return axiosClient.get('/admin/logs', { params });
  }
};

export default adminApi;
