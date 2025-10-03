/**
 * Performance Routes
 */

import express from 'express';
import {
  createPerformanceRecord,
  getAllPerformanceRecords,
  getPerformanceRecordById,
  getFreelancerPerformanceSummary,
  updatePerformanceRecord,
  deletePerformanceRecord,
} from '../controllers/performanceController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get freelancer performance summary
router.get(
  '/freelancer/:freelancerId/summary',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getFreelancerPerformanceSummary
);

// Get all performance records
router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getAllPerformanceRecords
);

// Get performance record by ID
router.get(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getPerformanceRecordById
);

// Create performance record
router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  createPerformanceRecord
);

// Update performance record
router.put(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  updatePerformanceRecord
);

// Delete performance record
router.delete(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  deletePerformanceRecord
);

export default router;