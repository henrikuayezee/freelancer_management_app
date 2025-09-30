/**
 * Freelancer Routes
 */

import express from 'express';
import {
  getAllFreelancers,
  getFreelancerById,
} from '../controllers/freelancerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and specific roles
router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getAllFreelancers
);

router.get(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getFreelancerById
);

export default router;