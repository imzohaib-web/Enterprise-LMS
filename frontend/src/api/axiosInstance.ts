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
    // TODO: Add JWT token logic here (Engineer 1)
    // Example: Read token from store/localStorage and append to Authorization header:
    // const token = localStorage.getItem('token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // TODO: Add response interceptor logic if needed in the future
    return response;
  },
  (error) => {
    // TODO: Add response error/refresh token logic here (Engineer 1)
    return Promise.reject(error);
  }
);

export default axiosInstance;
