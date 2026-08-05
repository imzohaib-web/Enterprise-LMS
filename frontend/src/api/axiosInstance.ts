import axios from 'axios';

// Read API URL from environment variables, defaulting to local v1 api endpoint
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Attach JWT token from localStorage if present
    const token = localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log network/auth errors for debugging
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - user token may be expired');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
