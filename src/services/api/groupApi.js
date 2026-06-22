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
  createGroupPost: (id, text, isQuestion = false, codeSnippet = '', codeLanguage = 'javascript') => {
    return axiosClient.post(`/groups/${id}/posts`, { text, isQuestion, codeSnippet, codeLanguage });
  },

  // Bình luận bài viết trong nhóm
  addGroupComment: (id, postId, text, codeSnippet = '', codeLanguage = 'javascript') => {
    return axiosClient.post(`/groups/${id}/posts/${postId}/comments`, {
      text: text.trim(),
      codeSnippet,
      codeLanguage,
    });
  },

  // Thăng chức / hạ chức Moderator (chỉ Admin của nhóm)
  toggleModerator: (groupId, userId) => {
    return axiosClient.put(`/groups/${groupId}/moderator`, { userId });
  },

  // Lấy danh sách bài đăng chờ duyệt (chỉ Admin / Mod nhóm)
  getPendingPosts: (groupId) => {
    return axiosClient.get(`/groups/${groupId}/pending-posts`);
  },

  // Phê duyệt bài viết (chỉ Admin / Mod nhóm)
  approvePost: (groupId, postId) => {
    return axiosClient.put(`/groups/${groupId}/posts/${postId}/status`, { status: 'approved' });
  },

  // Từ chối và xóa bài viết (chỉ Admin / Mod nhóm)
  rejectPost: (groupId, postId) => {
    return axiosClient.put(`/groups/${groupId}/posts/${postId}/status`, { status: 'rejected' });
  }
};

export default groupApi;
