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
  },
  exportCsv: () => {
    return axiosClient.get('/filters/export', { responseType: 'blob' });
  },
  importCsv: (formData) => {
    return axiosClient.post('/filters/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default filterApi;
