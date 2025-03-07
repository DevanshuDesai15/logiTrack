import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services for factory portal (admin/subadmin)
export const authService = {
  // Login admin/subadmin
  login: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    if (response.data) {
      localStorage.setItem('adminInfo', JSON.stringify(response.data));
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },
  
  // Logout admin/subadmin
  logout: () => {
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('adminToken');
  },
  
  // Get admin/subadmin profile
  getProfile: async () => {
    return api.get('/auth/profile');
  }
};

export default api; 