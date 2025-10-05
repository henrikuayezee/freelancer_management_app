/**
 * Authentication Routes
 */

import express from 'express';
import {
  login,
  getCurrentUser,
  logout,
  registerAdmin,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/register-admin', registerAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePassword);

export default router;