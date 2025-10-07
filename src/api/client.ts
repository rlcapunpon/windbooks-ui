import axios from 'axios';
import { getAccessToken } from '../utils/tokenStorage';

// Use proxy in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const baseURL = isDevelopment
  ? '/api'  // Use Vite proxy in development
  : import.meta.env.VITE_API_BASE_URL + '/api' || 'http://localhost:3000/api'; // Direct URL in production

const apiClient = axios.create({
  baseURL,
  withCredentials: !isDevelopment, // Disable credentials for proxy in development
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// HTTP Header size limits (conservative approach)
// Most servers limit total headers to 8KB, Authorization header should be under 4KB for safety
const MAX_AUTH_HEADER_SIZE = 4000; // 4KB limit for Authorization header
const WARN_AUTH_HEADER_SIZE = 2000; // Warn at 2KB

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    const token = getAccessToken();
    if (token) {
      const authHeader = `Bearer ${token}`;
      const headerSize = authHeader.length;
      
      // Log token size information
      if (headerSize > WARN_AUTH_HEADER_SIZE) {
        console.warn(`⚠️ Large Authorization header: ${headerSize} chars (${(headerSize/1024).toFixed(1)}KB)`);
      }
      
      // FIXED: Never send Authorization header if token is too large to prevent 431 errors
      if (headerSize > MAX_AUTH_HEADER_SIZE) {
        console.warn(`🚫 PREVENTING 431 ERROR: Skipping Authorization header (${headerSize} chars)`);
        console.log('🔄 Backend must handle authentication via sessions or alternative methods');
        // Important: DO NOT add Authorization header to prevent 431 errors
      } else {
        // Token is safe to use in headers for all endpoints
        config.headers.Authorization = authHeader;
        console.log('✅ Authorization header added (token size acceptable)');
      }
    } else {
      console.log('❌ No access token found');
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