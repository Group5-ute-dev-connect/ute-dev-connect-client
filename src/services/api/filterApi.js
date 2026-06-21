import axiosClient from './axiosClient';

export const filterApi = {
  getFilterConfig: () => {
    return axiosClient.get('/filters');
  },
  addBannedWord: (word) => {
    return axiosClient.post('/filters/words', { word });
  },
  deleteBannedWord: (word) => {
    return axiosClient.delete(`/filters/words/${encodeURIComponent(word)}`);
  },
  toggleAiFilter: (enabled) => {
    return axiosClient.put('/filters/ai', { enabled });
  }
};

export default filterApi;
