/**
 * Project Controller
 * Handles project creation, listing, and management
 */

import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';
import { createNotification } from './notificationController.js';
import { sendProjectAssignmentEmail } from '../services/emailService.js';

/**
 * Get All Projects
 * GET /api/projects
 */
export async function getAllProjects(req, res, next) {
  try {
    const {
      status,
      vertical,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    // Filters
    if (status) where.status = status;
    if (vertical) where.vertical = vertical;

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { projectId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const validSortFields = ['createdAt', 'name', 'startDate', 'projectId'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const projects = await prisma.project.findMany({
      where,
      orderBy: { [orderByField]: orderByDirection },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        _count: {
          select: {
            assignments: true,
            applications: true,
          },
        },
      },
    });

    const totalCount = await prisma.project.count({ where });

    return successResponse(res, {
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Project by ID
 * GET /api/projects/:id
 */
export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            freelancer: {
              select: {
                id: true,
                freelancerId: true,
                firstName: true,
                lastName: true,
                email: true,
                currentTier: true,
                currentGrade: true,
                status: true,
              },
            },
          },
        },
        applications: {
          include: {
            freelancer: {
              select: {
                id: true,
                freelancerId: true,
                firstName: true,
                lastName: true,
                email: true,
                currentTier: true,
                currentGrade: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignments: true,
            applications: true,
            performanceRecords: true,
          },
        },
      },
    });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    return successResponse(res, project);
  } catch (error) {
    next(error);
  }
}

/**
 * Create Project
 * POST /api/projects
 */
export async function createProject(req, res, next) {
  try {
    const {
      name,
      vertical,
      annotationRequired,
      description,
      freelancersRequired,
      startDate,
      endDate,
      speedPercentage,
      accuracyPercentage,
      assetsPerDay,
      hoursPerDay,
      evaluationFrequency,
      paymentModel,
      hourlyRateAnnotation,
      hourlyRateReview,
      perAssetRateAnnotation,
      perAssetRateReview,
      expectedTimePerAsset,
      perObjectRateAnnotation,
      perObjectRateReview,
    } = req.body;

    // Validation
    if (!name || !freelancersRequired || !startDate || !paymentModel) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Generate project ID
    const count = await prisma.project.count();
    const projectId = `AN${String(count + 1).padStart(3, '0')}`;

    const project = await prisma.project.create({
      data: {
        projectId,
        name,
        vertical: vertical || null,
        annotationRequired: annotationRequired || null,
        description: description || null,
        freelancersRequired: parseInt(freelancersRequired),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        speedPercentage: speedPercentage ? parseFloat(speedPercentage) : null,
        accuracyPercentage: accuracyPercentage ? parseFloat(accuracyPercentage) : 90.0,
        assetsPerDay: assetsPerDay ? parseInt(assetsPerDay) : null,
        hoursPerDay: hoursPerDay ? parseFloat(hoursPerDay) : null,
        evaluationFrequency: evaluationFrequency || 'WEEKLY',
        paymentModel,
        hourlyRateAnnotation: hourlyRateAnnotation ? parseFloat(hourlyRateAnnotation) : null,
        hourlyRateReview: hourlyRateReview ? parseFloat(hourlyRateReview) : null,
        perAssetRateAnnotation: perAssetRateAnnotation ? parseFloat(perAssetRateAnnotation) : null,
        perAssetRateReview: perAssetRateReview ? parseFloat(perAssetRateReview) : null,
        expectedTimePerAsset: expectedTimePerAsset ? parseFloat(expectedTimePerAsset) : null,
        perObjectRateAnnotation: perObjectRateAnnotation ? parseFloat(perObjectRateAnnotation) : null,
        perObjectRateReview: perObjectRateReview ? parseFloat(perObjectRateReview) : null,
        status: 'DRAFT',
        createdBy: req.user.id,
      },
    });

    return successResponse(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Project
 * PUT /api/projects/:id
 */
export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      vertical,
      annotationRequired,
      description,
      freelancersRequired,
      startDate,
      endDate,
      speedPercentage,
      accuracyPercentage,
      assetsPerDay,
      hoursPerDay,
      evaluationFrequency,
      paymentModel,
      hourlyRateAnnotation,
      hourlyRateReview,
      perAssetRateAnnotation,
      perAssetRateReview,
      expectedTimePerAsset,
      perObjectRateAnnotation,
      perObjectRateReview,
      status,
      openForApplications,
    } = req.body;

    // Check if project exists
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (vertical !== undefined) updateData.vertical = vertical;
    if (annotationRequired !== undefined) updateData.annotationRequired = annotationRequired;
    if (description !== undefined) updateData.description = description;
    if (freelancersRequired !== undefined) updateData.freelancersRequired = parseInt(freelancersRequired);
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (speedPercentage !== undefined) updateData.speedPercentage = speedPercentage ? parseFloat(speedPercentage) : null;
    if (accuracyPercentage !== undefined) updateData.accuracyPercentage = parseFloat(accuracyPercentage);
    if (assetsPerDay !== undefined) updateData.assetsPerDay = assetsPerDay ? parseInt(assetsPerDay) : null;
    if (hoursPerDay !== undefined) updateData.hoursPerDay = hoursPerDay ? parseFloat(hoursPerDay) : null;
    if (evaluationFrequency !== undefined) updateData.evaluationFrequency = evaluationFrequency;
    if (paymentModel !== undefined) updateData.paymentModel = paymentModel;
    if (hourlyRateAnnotation !== undefined) updateData.hourlyRateAnnotation = hourlyRateAnnotation ? parseFloat(hourlyRateAnnotation) : null;
    if (hourlyRateReview !== undefined) updateData.hourlyRateReview = hourlyRateReview ? parseFloat(hourlyRateReview) : null;
    if (perAssetRateAnnotation !== undefined) updateData.perAssetRateAnnotation = perAssetRateAnnotation ? parseFloat(perAssetRateAnnotation) : null;
    if (perAssetRateReview !== undefined) updateData.perAssetRateReview = perAssetRateReview ? parseFloat(perAssetRateReview) : null;
    if (expectedTimePerAsset !== undefined) updateData.expectedTimePerAsset = expectedTimePerAsset ? parseFloat(expectedTimePerAsset) : null;
    if (perObjectRateAnnotation !== undefined) updateData.perObjectRateAnnotation = perObjectRateAnnotation ? parseFloat(perObjectRateAnnotation) : null;
    if (perObjectRateReview !== undefined) updateData.perObjectRateReview = perObjectRateReview ? parseFloat(perObjectRateReview) : null;
    if (status !== undefined) updateData.status = status;
    if (openForApplications !== undefined) updateData.openForApplications = Boolean(openForApplications);

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updated, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Project
 * DELETE /api/projects/:id
 */
export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Project not found', 404);
    }

    await prisma.project.delete({ where: { id } });

    return successResponse(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Assign Freelancer to Project
 * POST /api/projects/:id/assign
 */
export async function assignFreelancerToProject(req, res, next) {
  try {
    const { id } = req.params;
    const { freelancerId, startDate, endDate, expectedAssetsPerDay, expectedHoursPerDay } = req.body;

    // Validate
    if (!freelancerId || !startDate) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Check if freelancer exists
    const freelancer = await prisma.freelancer.findUnique({ where: { id: freelancerId } });
    if (!freelancer) {
      return errorResponse(res, 'Freelancer not found', 404);
    }

    // Check if already assigned
    const existing = await prisma.projectAssignment.findUnique({
      where: {
        projectId_freelancerId: {
          projectId: id,
          freelancerId,
        },
      },
    });

    if (existing) {
      return errorResponse(res, 'Freelancer already assigned to this project', 400);
    }

    // Create assignment
    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId: id,
        freelancerId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        expectedAssetsPerDay: expectedAssetsPerDay ? parseInt(expectedAssetsPerDay) : null,
        expectedHoursPerDay: expectedHoursPerDay ? parseFloat(expectedHoursPerDay) : null,
        status: 'ACTIVE',
      },
      include: {
        freelancer: {
          select: {
            id: true,
            freelancerId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create notification for assigned freelancer
    await createNotification({
      userId: freelancer.userId,
      type: 'PROJECT_ASSIGNED',
      title: 'New Project Assignment',
      message: `You have been assigned to project: ${project.name}`,
      link: `/freelancer/projects/${id}`,
      relatedId: id,
      relatedType: 'PROJECT',
    });

    // Send project assignment email
    await sendProjectAssignmentEmail({
      email: freelancer.email,
      firstName: freelancer.firstName,
      projectName: project.name,
      projectId: project.projectId,
      startDate: assignment.startDate,
    });

    return successResponse(res, assignment, 'Freelancer assigned successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Remove Freelancer from Project
 * DELETE /api/projects/:id/assign/:freelancerId
 */
export async function removeFreelancerFromProject(req, res, next) {
  try {
    const { id, freelancerId } = req.params;

    const assignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_freelancerId: {
          projectId: id,
          freelancerId,
        },
      },
    });

    if (!assignment) {
      return errorResponse(res, 'Assignment not found', 404);
    }

    await prisma.projectAssignment.delete({
      where: {
        projectId_freelancerId: {
          projectId: id,
          freelancerId,
        },
      },
    });

    return successResponse(res, null, 'Freelancer removed from project');
  } catch (error) {
    next(error);
  }
}