import api from './api';

export const inventoryService = {
  // Get all inventory items
  getInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  // Get inventory item by ID
  getInventoryById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  // Create new inventory item
  createInventory: async (itemData) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  },

  // Update inventory item
  updateInventory: async (id, itemData) => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  // Delete inventory item
  deleteInventory: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  // Update inventory stock
  updateStock: async (id, adjustment, reason, reasonDetails) => {
    const response = await api.put(`/inventory/${id}/stock`, {
      adjustment,
      reason,
      reasonDetails
    });
    return response.data;
  },

  // Get inventory logs for a product
  getInventoryLogs: async (id) => {
    const response = await api.get(`/inventory/${id}/logs`);
    return response.data;
  }
};

export default inventoryService; 