import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
let baseURL = apiUrl;

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

export default axiosClient;
