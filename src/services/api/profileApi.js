import axiosClient from './axiosClient';

export const profileApi = {
  getProfile: (role) => {
    // role có thể là 'user' hoặc 'admin'
    return axiosClient.get(`/${role}/profile`);
  },
  editProfile: (data) => {
    return axiosClient.put('/profile', data);
  }
};
