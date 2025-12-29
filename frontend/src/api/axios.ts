import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Changed to relative path to use Vite Proxy in development
// In production (IIS), this works if frontend and backend are on the same domain
const API_BASE_URL = '/api/';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // IIS FIX: Some IIS configurations strip the standard Authorization header.
      // We use a custom header X-Auth-Token which the Django Middleware will map back.
      config.headers['X-Auth-Token'] = `Bearer ${token}`;
      // Standard header as fallback
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log Network Errors for easier debugging
    if (error.message === 'Network Error') {
      console.error('Network Error: Unable to connect to the server. Ensure Backend is running on port 8000.');
    }

    // Handle 401 Unauthorized (Token refresh logic would go here)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear invalid tokens
      // localStorage.removeItem('access_token');
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;