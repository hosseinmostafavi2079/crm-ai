import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// baseURL is set to /api/ to leverage the Vite proxy defined in vite.config.ts
// This forwards requests to http://127.0.0.1:8000/api/ avoiding CORS issues
const API_BASE_URL = '/api/';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Error Logging
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
        // Optional: Redirect to login or refresh token here
        console.warn('Unauthorized access - Token might be expired');
    }
    return Promise.reject(error);
  }
);

export default api;