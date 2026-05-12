import axiosClient from './axiosClient';

export const authApi = {
  sendOtp: (email) => {
    return axiosClient.post('/auth/forgot-password', { email });
  },
  resetPassword: (email, otp, newPassword) => {
    return axiosClient.post('/auth/reset-password', { email, otp, newPassword });
  },
};
