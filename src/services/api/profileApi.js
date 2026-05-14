import axiosClient from './axiosClient';

export const profileApi = {
  getProfile: () => {
    return axiosClient.get('/profile/me');
  },
  editProfile: (data) => {
    return axiosClient.put('/profile', data);
  }
};
