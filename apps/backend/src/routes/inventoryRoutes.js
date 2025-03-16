import express from 'express';
import {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryStock,
  getInventoryLogs
} from '../controllers/inventoryController.js';
import { protect, adminOnly, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all inventory items
router.get('/', protect, authorize(['admin', 'subadmin', 'operator']), getInventory);

// Get inventory item by ID
router.get('/:id', protect, authorize(['admin', 'subadmin', 'operator']), getInventoryById);

// Create new inventory item
router.post('/', protect, adminOnly, createInventoryItem);

// Update inventory item
router.put('/:id', protect, adminOnly, updateInventoryItem);

// Delete inventory item
router.delete('/:id', protect, adminOnly, deleteInventoryItem);

// Update inventory stock
router.put('/:id/stock', protect, adminOnly, updateInventoryStock);

// Get inventory logs for a product
router.get('/:id/logs', protect, adminOnly, getInventoryLogs);

export default router; 