/**
 * Freelancer Portal Controller
 * Handles freelancer-specific views and actions
 */

import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Get Freelancer Dashboard Data
 * GET /api/freelancer-portal/dashboard
 */
export async function getDashboard(req, res, next) {
  try {
    const freelancer = await prisma.freelancer.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
        projectAssignments: {
          include: {
            project: true,
          },
        },
        performanceRecords: {
          orderBy: { recordDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    // Calculate average performance
    const allRecords = await prisma.performanceRecord.findMany({
      where: { freelancerId: freelancer.id },
    });

    const avgPerformance =
      allRecords.length > 0
        ? allRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) / allRecords.length
        : 0;

    // Get active projects
    const activeProjects = freelancer.projectAssignments.filter(
      (pa) => pa.project.status === 'ACTIVE'
    );

    const dashboardData = {
      profile: {
        id: freelancer.id,
        freelancerId: freelancer.freelancerId,
        firstName: freelancer.firstName,
        lastName: freelancer.lastName,
        email: freelancer.email,
        status: freelancer.status,
        currentTier: freelancer.currentTier,
        currentGrade: freelancer.currentGrade,
      },
      stats: {
        activeProjects: activeProjects.length,
        totalProjects: freelancer.projectAssignments.length,
        avgPerformance: avgPerformance.toFixed(2),
        totalPerformanceRecords: allRecords.length,
      },
      recentPerformance: freelancer.performanceRecords,
      activeProjects: activeProjects.map((pa) => ({
        id: pa.project.id,
        name: pa.project.name,
        status: pa.project.status,
        startDate: pa.project.startDate,
        endDate: pa.project.endDate,
        role: pa.role,
        assignedAt: pa.assignedAt,
      })),
    };

    return successResponse(res, dashboardData);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Freelancer Profile
 * GET /api/freelancer-portal/profile
 */
export async function getProfile(req, res, next) {
  try {
    const freelancer = await prisma.freelancer.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
        application: true,
      },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    return successResponse(res, freelancer);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Freelancer Profile
 * PUT /api/freelancer-portal/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { phone, city, country, timezone, availabilityType, hoursPerWeek } = req.body;

    const freelancer = await prisma.freelancer.findUnique({
      where: { userId: req.user.id },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    const updated = await prisma.freelancer.update({
      where: { id: freelancer.id },
      data: {
        phone,
        city,
        country,
        timezone,
        availabilityType,
        hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : null,
      },
    });

    return successResponse(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get Available Projects
 * GET /api/freelancer-portal/projects/available
 */
export async function getAvailableProjects(req, res, next) {
  try {
    const freelancer = await prisma.freelancer.findUnique({
      where: { userId: req.user.id },
      include: {
        projectAssignments: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    // Get all active projects that are open for applications
    const projects = await prisma.project.findMany({
      where: {
        status: 'ACTIVE',
        openForApplications: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out projects the freelancer is already assigned to
    const assignedProjectIds = freelancer.projectAssignments.map((pa) => pa.projectId);
    const availableProjects = projects.filter((p) => !assignedProjectIds.includes(p.id));

    return successResponse(res, {
      projects: availableProjects,
      canApply: true, // Freelancers can apply to multiple projects
      currentStatus: freelancer.status,
      hasActiveProject: false, // Remove restriction
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Apply to Project
 * POST /api/freelancer-portal/projects/:projectId/apply
 */
export async function applyToProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    const freelancer = await prisma.freelancer.findUnique({
      where: { userId: req.user.id },
      include: {
        projectAssignments: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    // Freelancers can apply to multiple projects (removed restriction)

    // Check if project exists and is accepting applications
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.status !== 'ACTIVE') {
      return errorResponse(res, 'This project is not currently active', 400);
    }

    if (!project.openForApplications) {
      return errorResponse(res, 'This project is not accepting applications', 400);
    }

    // Check if already applied or assigned
    const existingAssignment = await prisma.projectAssignment.findFirst({
      where: {
        projectId,
        freelancerId: freelancer.id,
      },
    });

    if (existingAssignment) {
      return errorResponse(res, 'You have already applied to or are assigned to this project', 400);
    }

    // Create project application (we'll store this in projectAssignment with a pending status)
    // Admin can later approve and change status to ACTIVE
    const application = await prisma.projectAssignment.create({
      data: {
        projectId,
        freelancerId: freelancer.id,
        status: 'PENDING', // Special status for applications
        completionNotes: message, // Store application message in completionNotes
        startDate: new Date(), // Set to current date for applications
      },
    });

    return successResponse(res, application, 'Application submitted successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get Freelancer's Performance Records
 * GET /api/freelancer-portal/performance
 */
export async function getPerformanceRecords(req, res, next) {
  try {
    const freelancer = await prisma.freelancer.findUnique({
      where: { userId: req.user.id },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    const records = await prisma.performanceRecord.findMany({
      where: { freelancerId: freelancer.id },
      orderBy: { recordDate: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate summary
    const summary = {
      total: records.length,
      avgOverall: records.length > 0
        ? (records.reduce((sum, r) => sum + (r.overallScore || 0), 0) / records.length).toFixed(2)
        : 0,
      avgCOM: records.length > 0
        ? (records.reduce((sum, r) => sum + (r.comTotal || 0), 0) / records.length).toFixed(2)
        : 0,
      avgQUAL: records.length > 0
        ? (records.reduce((sum, r) => sum + (r.qualTotal || 0), 0) / records.length).toFixed(2)
        : 0,
    };

    return successResponse(res, { records, summary });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Freelancer's Projects
 * GET /api/freelancer-portal/projects/my-projects
 */
export async function getMyProjects(req, res, next) {
  try {
    const freelancer = await prisma.freelancer.findUnique({
      where: { userId: req.user.id },
      include: {
        projectAssignments: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    const projects = freelancer.projectAssignments.map((pa) => ({
      id: pa.project.id,
      name: pa.project.name,
      description: pa.project.description,
      status: pa.project.status,
      startDate: pa.project.startDate,
      endDate: pa.project.endDate,
      paymentModel: pa.project.paymentModel,
      role: pa.role,
      assignedAt: pa.assignedAt,
    }));

    return successResponse(res, projects);
  } catch (error) {
    next(error);
  }
}