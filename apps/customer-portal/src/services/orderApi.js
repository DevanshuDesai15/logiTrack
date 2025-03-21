import api from './api';

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user's orders (as a customer)
  getUserOrders: async () => {
    // The backend will filter orders by the authenticated user
    console.log('Calling /orders/my-orders API endpoint');
    
    try {
      // Let the interceptor handle the token - don't manually add it here
      console.log('Making request to get user orders');
      const response = await api.get('/orders/my-orders');
      
      console.log('API response received:', response.status);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} orders`);
      } else {
        console.warn('Response data is not an array:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      // Don't need to repeat the error logging here since the interceptor will do it
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};

export default orderService; 