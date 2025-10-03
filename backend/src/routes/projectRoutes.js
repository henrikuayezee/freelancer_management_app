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

export default router;