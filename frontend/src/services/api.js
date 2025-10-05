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
  registerAdmin: (data) => api.post('/api/auth/register-admin', data),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) => api.post('/api/auth/change-password', { currentPassword, newPassword }),
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
  update: (id, data) => api.put(`/api/freelancers/${id}`, data),
  importCSV: (csvData) => api.post('/api/freelancers/import/csv', { csvData }),
  exportCSV: (params) => {
    // Export with current filters
    const query = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/api/freelancers/export/csv?${query}`;
  },
};

// ====================
// PROJECTS API
// ====================

export const projectsAPI = {
  getAll: (params) => api.get('/api/projects', { params }),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  assignFreelancer: (projectId, data) => api.post(`/api/projects/${projectId}/assign`, data),
  removeFreelancer: (projectId, freelancerId) => api.delete(`/api/projects/${projectId}/assign/${freelancerId}`),
};

// ====================
// PERFORMANCE API
// ====================

export const performanceAPI = {
  getAll: (params) => api.get('/api/performance', { params }),
  getById: (id) => api.get(`/api/performance/${id}`),
  create: (data) => api.post('/api/performance', data),
  update: (id, data) => api.put(`/api/performance/${id}`, data),
  delete: (id) => api.delete(`/api/performance/${id}`),
  getFreelancerSummary: (freelancerId, params) => api.get(`/api/performance/freelancer/${freelancerId}/summary`, { params }),
};

// ====================
// TIERING API
// ====================

export const tieringAPI = {
  getStats: () => api.get('/api/tiering/stats'),
  calculate: (freelancerId, params) => api.post(`/api/tiering/calculate/${freelancerId}`, null, { params }),
  apply: (freelancerId, data) => api.put(`/api/tiering/apply/${freelancerId}`, data),
  calculateAll: (data) => api.post('/api/tiering/calculate-all', data),
};

// ====================
// FREELANCER PORTAL API
// ====================

export const freelancerPortalAPI = {
  getDashboard: () => api.get('/api/freelancer-portal/dashboard'),
  getProfile: () => api.get('/api/freelancer-portal/profile'),
  updateProfile: (data) => api.put('/api/freelancer-portal/profile', data),
  getAvailableProjects: () => api.get('/api/freelancer-portal/projects/available'),
  getMyProjects: () => api.get('/api/freelancer-portal/projects/my-projects'),
  applyToProject: (projectId, data) => api.post(`/api/freelancer-portal/projects/${projectId}/apply`, data),
  getPerformance: () => api.get('/api/freelancer-portal/performance'),
};

// ====================
// USERS API
// ====================

export const usersAPI = {
  getAll: (params) => api.get('/api/users', { params }),
  getStats: () => api.get('/api/users/stats'),
  updateRole: (id, data) => api.put(`/api/users/${id}/role`, data),
  toggleActive: (id) => api.put(`/api/users/${id}/toggle-active`),
  delete: (id) => api.delete(`/api/users/${id}`),
  resetPassword: (id, data) => api.post(`/api/users/${id}/reset-password`, data),
};

// ====================
// NOTIFICATIONS API
// ====================

export const notificationsAPI = {
  getAll: (params) => api.get('/api/notifications', { params }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

// ====================
// PAYMENTS API
// ====================

export const paymentsAPI = {
  getAll: (params) => api.get('/api/payments', { params }),
  getById: (id) => api.get(`/api/payments/${id}`),
  create: (data) => api.post('/api/payments', data),
  update: (id, data) => api.put(`/api/payments/${id}`, data),
  delete: (id) => api.delete(`/api/payments/${id}`),
  calculate: (data) => api.post('/api/payments/calculate', data),
  getStats: (params) => api.get('/api/payments/stats', { params }),
  getMyPayments: (params) => api.get('/api/payments/freelancer/my-payments', { params }),
  exportCSV: (params) => {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/api/payments/export/csv?${query}`;
  },
  exportLineItemsCSV: (params) => {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/api/payments/export/csv/line-items?${query}`;
  },
};

// ====================
// DASHBOARD API
// ====================

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getPerformanceOverview: () => api.get('/api/dashboard/performance-overview'),
  getPaymentStats: () => api.get('/api/dashboard/payment-stats'),
};

// ====================
// FORM TEMPLATE API
// ====================

export const formTemplateAPI = {
  getTemplate: () => api.get('/api/form-template'),
  updateTemplate: (data) => api.put('/api/form-template', data),
  resetTemplate: () => api.post('/api/form-template/reset'),
};

export default api;