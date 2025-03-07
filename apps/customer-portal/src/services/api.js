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
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  // Register a new user
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('userToken', response.data.token);
    }
    return response.data;
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
  },
  
  // Get user profile
  getUserProfile: async () => {
    return api.get('/auth/profile');
  }
};

export default api; 