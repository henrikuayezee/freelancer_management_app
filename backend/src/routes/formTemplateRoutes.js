/**
 * Form Template Routes
 * Routes for managing application form template
 */

import express from 'express';
import * as formTemplateController from '../controllers/formTemplateController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route - get form template (for applicants)
router.get('/', formTemplateController.getFormTemplate);

// Admin routes - manage form template
router.put('/', authenticate, requireRole(['ADMIN']), formTemplateController.updateFormTemplate);
router.post('/reset', authenticate, requireRole(['ADMIN']), formTemplateController.resetFormTemplate);

export default router;
