import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
let baseURL = apiUrl || '/api';

// Ở môi trường dev, lấy phần pathname (VD: '/api') để request đi qua proxy của Vite nhằm tránh CORS
if (import.meta.env.DEV && apiUrl && apiUrl.startsWith('http')) {
  try {
    baseURL = new URL(apiUrl).pathname;
  } catch (e) {
    console.error("Invalid URL in VITE_API_URL");
  }
}

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
