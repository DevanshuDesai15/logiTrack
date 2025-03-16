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
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};

export default orderService; 