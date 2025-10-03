/**
 * Payment Routes
 * API endpoints for payment management
 */

import express from 'express';
import {
  getAllPayments,
  getPaymentById,
  getMyPayments,
  createPaymentRecord,
  updatePaymentRecord,
  deletePaymentRecord,
  calculatePayment,
  getPaymentStats,
  exportPaymentsCSV,
  exportLineItemsCSV,
} from '../controllers/paymentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Freelancer routes (must be before /:id route)
router.get('/freelancer/my-payments', getMyPayments);

// Admin/Finance routes
router.get('/stats', requireRole(['ADMIN', 'FINANCE']), getPaymentStats);
router.get('/export/csv', requireRole(['ADMIN', 'FINANCE']), exportPaymentsCSV);
router.get('/export/csv/line-items', requireRole(['ADMIN', 'FINANCE']), exportLineItemsCSV);
router.get('/', requireRole(['ADMIN', 'FINANCE']), getAllPayments);
router.post('/', requireRole(['ADMIN', 'FINANCE']), createPaymentRecord);
router.post('/calculate', requireRole(['ADMIN', 'FINANCE']), calculatePayment);
router.get('/:id', requireRole(['ADMIN', 'FINANCE']), getPaymentById);
router.put('/:id', requireRole(['ADMIN', 'FINANCE']), updatePaymentRecord);
router.delete('/:id', requireRole(['ADMIN']), deletePaymentRecord);

export default router;
