import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      });
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        return Promise.reject({
          status,
          message: data?.error || data?.message || 'Invalid request.',
        });
      case 401:
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject({
          status,
          message: data?.message || 'Session expired. Please login again.',
        });
      case 403:
        return Promise.reject({
          status,
          message: data?.error || data?.message || 'Access denied.',
        });
      case 404:
        return Promise.reject({
          status,
          message: data?.error || data?.message || 'Resource not found.',
        });
      case 500:
        return Promise.reject({
          status,
          message: 'Server error. Please try again later.',
        });
      case 503:
        return Promise.reject({
          status,
          message: 'Payment service unavailable. Please try again later.',
        });
      default:
        return Promise.reject({
          status,
          message: data?.error || data?.message || 'An error occurred.',
        });
    }
  }
);

export const customerAPI = {
  getProfile: () => api.get('/api/customer/auth/me'),

  createOrder: (data) => api.post('/api/payment/create-order', data),

  verifyPayment: (data) => api.post('/api/payment/verify', data),

  getOrder: (orderId) => api.get(`/api/payment/orders/${orderId}`),

  clearCart: () => api.post('/api/cart/clear', {}),
};

export const authAPI = {
  login: (email, password) =>
    api.post('/api/customer/auth/login', { email, password }),

  register: (name, email, password) =>
    api.post('/api/customer/auth/register', { name, email, password }),

  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
  },
};

export default api;