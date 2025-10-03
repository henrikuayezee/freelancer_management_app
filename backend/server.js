/**
 * Freelancer Management Platform - Backend Server
 * Main entry point for the Express application
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import freelancerRoutes from './src/routes/freelancerRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import performanceRoutes from './src/routes/performanceRoutes.js';
import tieringRoutes from './src/routes/tieringRoutes.js';
import freelancerPortalRoutes from './src/routes/freelancerPortalRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import formTemplateRoutes from './src/routes/formTemplateRoutes.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/tiering', tieringRoutes);
app.use('/api/freelancer-portal', freelancerPortalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/form-template', formTemplateRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Freelancer Management Platform - Backend    ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/applications (public)');
  console.log('  GET    /api/applications (admin)');
  console.log('  POST   /api/applications/:id/approve (admin)');
  console.log('  POST   /api/applications/:id/reject (admin)');
  console.log('  GET    /api/freelancers (admin)');
  console.log('');
  console.log('Press CTRL+C to stop the server');
  console.log('════════════════════════════════════════════════');
});