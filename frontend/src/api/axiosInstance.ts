import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (can be used for adding auth tokens in the future)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (can be used for error handling globally)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors e.g. token expired (401)
    return Promise.reject(error);
  }
);

export default axiosInstance;
