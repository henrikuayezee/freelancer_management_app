/**
 * Tiering Routes
 */

import express from 'express';
import {
  calculateTierGrade,
  applyTierGrade,
  calculateAllTierGrades,
  getTierStats,
} from '../controllers/tieringController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get tier distribution stats
router.get(
  '/stats',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  getTierStats
);

// Calculate tier and grade for a freelancer
router.post(
  '/calculate/:freelancerId',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  calculateTierGrade
);

// Apply calculated tier and grade
router.put(
  '/apply/:freelancerId',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  applyTierGrade
);

// Bulk calculate for all freelancers
router.post(
  '/calculate-all',
  authenticate,
  requireRole(['ADMIN']),
  calculateAllTierGrades
);

export default router;