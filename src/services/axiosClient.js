import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
let apiPath = "/api";
try {
  apiPath = new URL(apiUrl).pathname;
} catch (e) {
  apiPath = apiUrl;
}

const axiosClient = axios.create({
  baseURL: apiPath,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Có lỗi xảy ra, vui lòng thử lại.";

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;