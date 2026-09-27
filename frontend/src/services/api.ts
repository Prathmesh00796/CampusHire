// Central API service using Axios
// All API calls go through this module — easy to maintain and debug

import axios from 'axios';

const API_BASE = '/api';

// Create Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT Token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campushire_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — force logout
      localStorage.removeItem('campushire_token');
      localStorage.removeItem('campushire_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
