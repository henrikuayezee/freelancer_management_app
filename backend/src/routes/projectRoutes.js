/**
 * Project Routes
 */

import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignFreelancerToProject,
  removeFreelancerFromProject,
  getProjectApplications,
  approveProjectApplication,
  rejectProjectApplication,
} from '../controllers/projectController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get(
  '/',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getAllProjects
);

// Get project by ID
router.get(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA']),
  getProjectById
);

// Create project
router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  createProject
);

// Update project
router.put(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  updateProject
);

// Delete project
router.delete(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  deleteProject
);

// Assign freelancer to project
router.post(
  '/:id/assign',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  assignFreelancerToProject
);

// Remove freelancer from project
router.delete(
  '/:id/assign/:freelancerId',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  removeFreelancerFromProject
);

// Get project applications (PENDING assignments)
router.get(
  '/:id/applications',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  getProjectApplications
);

// Approve project application
router.post(
  '/:id/applications/:freelancerId/approve',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  approveProjectApplication
);

// Reject project application
router.post(
  '/:id/applications/:freelancerId/reject',
  authenticate,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  rejectProjectApplication
);

export default router;