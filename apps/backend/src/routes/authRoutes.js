import express from 'express';
import {
  registerUser,
  loginUser,
  loginAdmin,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);

// Protected routes
router.get('/profile', protect, getUserProfile);

export default router; 