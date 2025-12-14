import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

