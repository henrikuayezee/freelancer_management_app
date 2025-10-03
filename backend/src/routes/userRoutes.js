/**
 * User Management Routes
 */

import express from 'express';
import {
  getAllUsers,
  getUserStats,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  resetUserPassword,
} from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// Get all users
router.get('/', getAllUsers);

// Get user stats
router.get('/stats', getUserStats);

// Update user role
router.put('/:id/role', updateUserRole);

// Toggle user active status
router.put('/:id/toggle-active', toggleUserActive);

// Delete user
router.delete('/:id', deleteUser);

// Reset user password
router.post('/:id/reset-password', resetUserPassword);

export default router;