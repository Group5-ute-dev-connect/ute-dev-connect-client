import axiosClient from './axiosClient';

export const groupApi = {
  // Lấy danh sách nhóm (có phân trang và tìm kiếm theo q)
  getAllGroups: (page = 1, limit = 10, q = '') => {
    return axiosClient.get(`/groups?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`);
  },

  // Tạo nhóm mới
  createGroup: (name, description) => {
    return axiosClient.post('/groups', { name, description });
  },

  // Lấy chi tiết nhóm theo ID
  getGroupById: (id) => {
    return axiosClient.get(`/groups/${id}`);
  },

  // Tham gia nhóm
  joinGroup: (id) => {
    return axiosClient.put(`/groups/${id}/join`);
  },

  // Rời nhóm
  leaveGroup: (id) => {
    return axiosClient.put(`/groups/${id}/leave`);
  },

  // Xóa nhóm (soft delete, chỉ admin của nhóm)
  deleteGroup: (id) => {
    return axiosClient.delete(`/groups/${id}`);
  },

  // Lấy bảng tin (feed) của nhóm
  getGroupFeed: (id) => {
    return axiosClient.get(`/groups/${id}/feed`);
  },

  // Đăng bài viết mới trong nhóm
  createGroupPost: (id, text) => {
    return axiosClient.post(`/groups/${id}/posts`, { text });
  },

  // Bình luận bài viết trong nhóm
  addGroupComment: (id, postId, text) => {
    return axiosClient.post(`/groups/${id}/posts/${postId}/comments`, {
      text: text.trim()
    });
  }
};

export default groupApi;
