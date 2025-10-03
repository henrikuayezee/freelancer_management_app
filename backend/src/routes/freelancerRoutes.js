/**
 * Freelancer Routes
 */

import express from 'express';
import {
  getAllFreelancers,
  getFreelancerById,
  updateFreelancer,
  exportFreelancersCSV,
  importFreelancersCSV,
} from '../controllers/freelancerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// CSV Import (must be before /:id route)
router.post(
  '/import/csv',
  authenticate,
  requireRole(['ADMIN']),
  importFreelancersCSV
);

// CSV Export (must be before /:id route)
router.get(
  '/export/csv',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  exportFreelancersCSV
);

// Get all freelancers
router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getAllFreelancers
);

// Get freelancer by ID
router.get(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getFreelancerById
);

// Update freelancer
router.put(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  updateFreelancer
);

export default router;