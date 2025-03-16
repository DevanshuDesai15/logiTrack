import api from './api';

export const orderService = {
  // Get all orders
  getOrders: async (status) => {
    let url = '/orders';
    if (status) {
      url += `?status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};

export default orderService; 