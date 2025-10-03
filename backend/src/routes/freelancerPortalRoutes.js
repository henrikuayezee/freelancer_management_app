/**
 * Freelancer Portal Routes
 */

import express from 'express';
import {
  getDashboard,
  getProfile,
  updateProfile,
  getAvailableProjects,
  applyToProject,
  getPerformanceRecords,
  getMyProjects,
} from '../controllers/freelancerPortalController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and FREELANCER role
router.use(authenticate);
router.use(requireRole(['FREELANCER']));

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Projects
router.get('/projects/available', getAvailableProjects);
router.get('/projects/my-projects', getMyProjects);
router.post('/projects/:projectId/apply', applyToProject);

// Performance
router.get('/performance', getPerformanceRecords);

export default router;