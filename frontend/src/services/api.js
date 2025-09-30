/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ====================
// AUTH API
// ====================

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// ====================
// APPLICATIONS API
// ====================

export const applicationsAPI = {
  submit: (data) => api.post('/api/applications', data),
  getAll: (params) => api.get('/api/applications', { params }),
  getById: (id) => api.get(`/api/applications/${id}`),
  approve: (id) => api.post(`/api/applications/${id}/approve`),
  reject: (id, reason) => api.post(`/api/applications/${id}/reject`, { reason }),
};

// ====================
// FREELANCERS API
// ====================

export const freelancersAPI = {
  getAll: (params) => api.get('/api/freelancers', { params }),
  getById: (id) => api.get(`/api/freelancers/${id}`),
};

export default api;