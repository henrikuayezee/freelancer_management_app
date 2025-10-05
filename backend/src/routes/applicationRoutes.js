/**
 * Application Routes
 */

import express from 'express';
import {
  submitApplication,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  deleteApplication,
} from '../controllers/applicationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/', submitApplication);

// Admin/PM/Training Lead routes
router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD']),
  getAllApplications
);

router.get(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD']),
  getApplicationById
);

router.post(
  '/:id/approve',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  approveApplication
);

router.post(
  '/:id/reject',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  rejectApplication
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  deleteApplication
);

export default router;