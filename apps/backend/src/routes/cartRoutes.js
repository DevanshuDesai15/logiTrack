import express from 'express';
import {
  getUserCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes are protected and require authentication
router.use(protect);

// Get user's cart
router.get('/', getUserCart);

// Add item to cart
router.post('/', addToCart);

// Sync localStorage cart with database
router.post('/sync', syncCart);

// Update item quantity
router.put('/:productId', updateCartItem);

// Remove item from cart
router.delete('/:productId', removeCartItem);

// Clear entire cart
router.delete('/', clearCart);

export default router; 