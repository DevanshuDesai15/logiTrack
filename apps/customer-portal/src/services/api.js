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
      // Always set the Authorization header with the current token
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug for development
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        hasAuthHeader: !!config.headers.Authorization,
      });
    } else {
      console.log('API Request without token:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response success [${response.config.url}]:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Response error:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
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
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    return api.post('/auth/create-profile', profileData);
  }
};

// Cart services
export const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  // Update item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeCartItem: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Sync localStorage cart with database (for when user logs in)
  syncCart: async (cartItems) => {
    const response = await api.post('/cart/sync', { items: cartItems });
    return response.data;
  }
};

export default api; 