import api from './api';

export const productService = {
  // Get all products (from inventory)
  getProducts: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    const products = await productService.getProducts();
    return products.filter(product => product.category === category);
  }
};

export default productService; 