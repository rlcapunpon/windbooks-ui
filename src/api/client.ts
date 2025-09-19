import axios from 'axios';
import { getAccessToken } from '../utils/tokenStorage';

// Use proxy in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const baseURL = isDevelopment
  ? '/api'  // Use Vite proxy in development
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // Direct URL in production

const apiClient = axios.create({
  baseURL,
  withCredentials: !isDevelopment, // Disable credentials for proxy in development
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);

    // Handle CORS errors specifically
    if (error.message.includes('CORS') || error.code === 'ERR_NETWORK') {
      console.error('CORS/Network Error detected. Please check backend CORS configuration.');
      console.error('Make sure backend allows origin:', window.location.origin);
    }

    return Promise.reject(error);
  }
);

export default apiClient;