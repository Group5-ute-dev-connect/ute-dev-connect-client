import axiosClient from './axiosClient';

export const searchApi = {
  // Tìm kiếm tổng hợp (q, type, tag, skill, page, limit)
  search: (params) => {
    // Lọc bỏ các param rỗng
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });

    return axiosClient.get('/search', { params: cleanParams });
  }
};

export default searchApi;
