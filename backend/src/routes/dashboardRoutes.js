/**
 * Dashboard Routes
 * Routes for admin dashboard statistics
 */

import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require admin authentication
router.use(authenticate);
router.use(requireRole(['ADMIN', 'PROJECT_MANAGER']));

// Dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);
router.get('/performance-overview', dashboardController.getPerformanceOverview);
router.get('/payment-stats', dashboardController.getPaymentStats);

export default router;
