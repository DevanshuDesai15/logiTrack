import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new order
router.post('/', protect, createOrder);

// Get all orders
router.get('/', protect, authorize(['admin', 'subadmin', 'operator']), getOrders);

// Get order by ID
router.get('/:id', protect, getOrderById);

// Update order status
router.put('/:id/status', protect, authorize(['admin', 'subadmin', 'operator']), updateOrderStatus);

export default router; 