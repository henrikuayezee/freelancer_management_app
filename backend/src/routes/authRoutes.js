/**
 * Authentication Routes
 */

import express from 'express';
import { login, getCurrentUser, logout, registerAdmin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/register-admin', registerAdmin);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;