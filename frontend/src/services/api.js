import axios from 'axios';

// Detect if we're on GitHub Pages (production) or localhost (development)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isProduction 
    ? 'https://your-backend-url.herokuapp.com/api' // Replace with your deployed backend URL
    : 'http://localhost:5000/api'
  );

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (backend not available)
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      if (isProduction) {
        error.userMessage = 'Backend API is not available. Please deploy the backend server or update REACT_APP_API_URL environment variable.';
      } else {
        error.userMessage = 'Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000';
      }
    }
    return Promise.reject(error);
  }
);

// Menu API
export const getMenu = (category) => api.get('/menu', { params: { category } });
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const createMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Order API
export const createOrder = (data) => api.post('/order', data);
export const getOrder = (orderId) => api.get(`/order/${orderId}`);
export const getAllOrders = (params) => api.get('/order', { params });
export const markReceiptPrinted = (orderId) => api.put(`/order/${orderId}/receipt`);
export const updateOrderStatus = (orderId, status) => api.put(`/order/${orderId}/status`, { status });

// Payment API
export const processPayment = (data) => api.post('/payment', data);

// Admin API
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const verifyAdmin = () => api.get('/admin/verify');
export const getDashboardStats = () => api.get('/admin/dashboard/stats');

export default api;

