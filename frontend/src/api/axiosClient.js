import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor (tự động đính kèm token nếu có)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (xử lý dữ liệu trả về và lỗi tập trung)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Có thể xử lý lỗi chung (401, 403, 500...) tại đây
    return Promise.reject(error);
  }
);

export default axiosClient;
