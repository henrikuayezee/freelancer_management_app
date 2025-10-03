/**
 * Performance Controller
 * Handles performance tracking, evaluation, and reporting
 */

import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';
import { createNotification } from './notificationController.js';
import { sendPerformanceReviewEmail } from '../services/emailService.js';

/**
 * Create Performance Record
 * POST /api/performance
 */
export async function createPerformanceRecord(req, res, next) {
  try {
    const {
      freelancerId,
      projectId,
      recordType,
      recordDate,
      hoursWorked,
      assetsCompleted,
      tasksCompleted,
      avgTimePerTask,
      comResponsibility,
      comCommitment,
      comInitiative,
      comWillingness,
      comCommunication,
      qualSpeed,
      qualDelibOmission,
      qualAccuracy,
      qualAttention,
      qualUnannotated,
      qualUnderstanding,
      qualRejectedCount,
      notes,
    } = req.body;

    // Validation
    if (!freelancerId || !recordType) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Calculate COM total (average of COM scores)
    const comScores = [
      comResponsibility,
      comCommitment,
      comInitiative,
      comWillingness,
      comCommunication,
    ].filter((s) => s !== undefined && s !== null);
    const comTotal = comScores.length > 0 ? comScores.reduce((a, b) => a + b, 0) / comScores.length : null;

    // Calculate QUAL total (average of QUAL scores)
    const qualScores = [
      qualSpeed,
      qualDelibOmission,
      qualAccuracy,
      qualAttention,
      qualUnannotated,
      qualUnderstanding,
    ].filter((s) => s !== undefined && s !== null);
    const qualTotal = qualScores.length > 0 ? qualScores.reduce((a, b) => a + b, 0) / qualScores.length : null;

    // Calculate overall score (average of COM and QUAL totals)
    const overallScore =
      comTotal !== null && qualTotal !== null ? (comTotal + qualTotal) / 2 : comTotal || qualTotal || null;

    // Extract month and year from recordDate
    const date = recordDate ? new Date(recordDate) : new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const record = await prisma.performanceRecord.create({
      data: {
        freelancerId,
        projectId: projectId || null,
        recordType,
        recordDate: date,
        month,
        year,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        assetsCompleted: assetsCompleted ? parseInt(assetsCompleted) : null,
        tasksCompleted: tasksCompleted ? parseInt(tasksCompleted) : null,
        avgTimePerTask: avgTimePerTask ? parseFloat(avgTimePerTask) : null,
        comResponsibility: comResponsibility ? parseFloat(comResponsibility) : null,
        comCommitment: comCommitment ? parseFloat(comCommitment) : null,
        comInitiative: comInitiative ? parseFloat(comInitiative) : null,
        comWillingness: comWillingness ? parseFloat(comWillingness) : null,
        comCommunication: comCommunication ? parseFloat(comCommunication) : null,
        comTotal,
        qualSpeed: qualSpeed ? parseFloat(qualSpeed) : null,
        qualDelibOmission: qualDelibOmission ? parseFloat(qualDelibOmission) : null,
        qualAccuracy: qualAccuracy ? parseFloat(qualAccuracy) : null,
        qualAttention: qualAttention ? parseFloat(qualAttention) : null,
        qualUnannotated: qualUnannotated ? parseFloat(qualUnannotated) : null,
        qualUnderstanding: qualUnderstanding ? parseFloat(qualUnderstanding) : null,
        qualRejectedCount: qualRejectedCount ? parseInt(qualRejectedCount) : null,
        qualTotal,
        overallScore,
        recordedBy: req.user.id,
        notes: notes || null,
      },
      include: {
        freelancer: {
          select: {
            freelancerId: true,
            firstName: true,
            lastName: true,
            email: true,
            userId: true,
          },
        },
        project: {
          select: {
            projectId: true,
            name: true,
          },
        },
      },
    });

    // Create notification for the freelancer about new performance review
    await createNotification({
      userId: record.freelancer.userId,
      type: 'PERFORMANCE_UPDATE',
      title: 'New Performance Review',
      message: `A new performance review has been recorded. Overall score: ${overallScore ? overallScore.toFixed(2) : 'N/A'}`,
      link: '/freelancer/performance',
      relatedId: record.id,
      relatedType: 'PERFORMANCE',
    });

    // Send performance review email
    await sendPerformanceReviewEmail({
      email: record.freelancer.email,
      firstName: record.freelancer.firstName,
      overallScore: overallScore,
      recordDate: date,
    });

    return successResponse(res, record, 'Performance record created successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Get All Performance Records
 * GET /api/performance
 */
export async function getAllPerformanceRecords(req, res, next) {
  try {
    const {
      freelancerId,
      projectId,
      recordType,
      year,
      month,
      sortBy = 'recordDate',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    if (freelancerId) where.freelancerId = freelancerId;
    if (projectId) where.projectId = projectId;
    if (recordType) where.recordType = recordType;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const validSortFields = ['recordDate', 'overallScore', 'createdAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'recordDate';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const records = await prisma.performanceRecord.findMany({
      where,
      orderBy: { [orderByField]: orderByDirection },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        freelancer: {
          select: {
            freelancerId: true,
            firstName: true,
            lastName: true,
            currentTier: true,
            currentGrade: true,
          },
        },
        project: {
          select: {
            projectId: true,
            name: true,
          },
        },
      },
    });

    const totalCount = await prisma.performanceRecord.count({ where });

    return successResponse(res, {
      records,
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
 * Get Performance Record by ID
 * GET /api/performance/:id
 */
export async function getPerformanceRecordById(req, res, next) {
  try {
    const { id } = req.params;

    const record = await prisma.performanceRecord.findUnique({
      where: { id },
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
        project: {
          select: {
            id: true,
            projectId: true,
            name: true,
          },
        },
      },
    });

    if (!record) {
      return errorResponse(res, 'Performance record not found', 404);
    }

    return successResponse(res, record);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Freelancer Performance Summary
 * GET /api/performance/freelancer/:freelancerId/summary
 */
export async function getFreelancerPerformanceSummary(req, res, next) {
  try {
    const { freelancerId } = req.params;
    const { year, month, projectId } = req.query;

    const where = { freelancerId };
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);
    if (projectId) where.projectId = projectId;

    const records = await prisma.performanceRecord.findMany({
      where,
      orderBy: { recordDate: 'desc' },
    });

    if (records.length === 0) {
      return successResponse(res, {
        freelancerId,
        totalRecords: 0,
        summary: null,
      });
    }

    // Calculate averages
    const avgComTotal = records.filter((r) => r.comTotal).reduce((sum, r) => sum + r.comTotal, 0) / records.filter((r) => r.comTotal).length || 0;
    const avgQualTotal = records.filter((r) => r.qualTotal).reduce((sum, r) => sum + r.qualTotal, 0) / records.filter((r) => r.qualTotal).length || 0;
    const avgOverallScore = records.filter((r) => r.overallScore).reduce((sum, r) => sum + r.overallScore, 0) / records.filter((r) => r.overallScore).length || 0;
    const totalHoursWorked = records.filter((r) => r.hoursWorked).reduce((sum, r) => sum + r.hoursWorked, 0);
    const totalAssetsCompleted = records.filter((r) => r.assetsCompleted).reduce((sum, r) => sum + r.assetsCompleted, 0);
    const totalTasksCompleted = records.filter((r) => r.tasksCompleted).reduce((sum, r) => sum + r.tasksCompleted, 0);

    return successResponse(res, {
      freelancerId,
      totalRecords: records.length,
      summary: {
        avgComTotal: avgComTotal.toFixed(2),
        avgQualTotal: avgQualTotal.toFixed(2),
        avgOverallScore: avgOverallScore.toFixed(2),
        totalHoursWorked,
        totalAssetsCompleted,
        totalTasksCompleted,
      },
      recentRecords: records.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Performance Record
 * PUT /api/performance/:id
 */
export async function updatePerformanceRecord(req, res, next) {
  try {
    const { id } = req.params;
    const {
      hoursWorked,
      assetsCompleted,
      tasksCompleted,
      avgTimePerTask,
      comResponsibility,
      comCommitment,
      comInitiative,
      comWillingness,
      comCommunication,
      qualSpeed,
      qualDelibOmission,
      qualAccuracy,
      qualAttention,
      qualUnannotated,
      qualUnderstanding,
      qualRejectedCount,
      notes,
    } = req.body;

    const existing = await prisma.performanceRecord.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Performance record not found', 404);
    }

    // Build update data
    const updateData = {};
    if (hoursWorked !== undefined) updateData.hoursWorked = hoursWorked ? parseFloat(hoursWorked) : null;
    if (assetsCompleted !== undefined) updateData.assetsCompleted = assetsCompleted ? parseInt(assetsCompleted) : null;
    if (tasksCompleted !== undefined) updateData.tasksCompleted = tasksCompleted ? parseInt(tasksCompleted) : null;
    if (avgTimePerTask !== undefined) updateData.avgTimePerTask = avgTimePerTask ? parseFloat(avgTimePerTask) : null;
    if (comResponsibility !== undefined) updateData.comResponsibility = comResponsibility ? parseFloat(comResponsibility) : null;
    if (comCommitment !== undefined) updateData.comCommitment = comCommitment ? parseFloat(comCommitment) : null;
    if (comInitiative !== undefined) updateData.comInitiative = comInitiative ? parseFloat(comInitiative) : null;
    if (comWillingness !== undefined) updateData.comWillingness = comWillingness ? parseFloat(comWillingness) : null;
    if (comCommunication !== undefined) updateData.comCommunication = comCommunication ? parseFloat(comCommunication) : null;
    if (qualSpeed !== undefined) updateData.qualSpeed = qualSpeed ? parseFloat(qualSpeed) : null;
    if (qualDelibOmission !== undefined) updateData.qualDelibOmission = qualDelibOmission ? parseFloat(qualDelibOmission) : null;
    if (qualAccuracy !== undefined) updateData.qualAccuracy = qualAccuracy ? parseFloat(qualAccuracy) : null;
    if (qualAttention !== undefined) updateData.qualAttention = qualAttention ? parseFloat(qualAttention) : null;
    if (qualUnannotated !== undefined) updateData.qualUnannotated = qualUnannotated ? parseFloat(qualUnannotated) : null;
    if (qualUnderstanding !== undefined) updateData.qualUnderstanding = qualUnderstanding ? parseFloat(qualUnderstanding) : null;
    if (qualRejectedCount !== undefined) updateData.qualRejectedCount = qualRejectedCount ? parseInt(qualRejectedCount) : null;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate totals if COM or QUAL scores changed
    const comScores = [
      updateData.comResponsibility ?? existing.comResponsibility,
      updateData.comCommitment ?? existing.comCommitment,
      updateData.comInitiative ?? existing.comInitiative,
      updateData.comWillingness ?? existing.comWillingness,
      updateData.comCommunication ?? existing.comCommunication,
    ].filter((s) => s !== null);

    if (comScores.length > 0) {
      updateData.comTotal = comScores.reduce((a, b) => a + b, 0) / comScores.length;
    }

    const qualScores = [
      updateData.qualSpeed ?? existing.qualSpeed,
      updateData.qualDelibOmission ?? existing.qualDelibOmission,
      updateData.qualAccuracy ?? existing.qualAccuracy,
      updateData.qualAttention ?? existing.qualAttention,
      updateData.qualUnannotated ?? existing.qualUnannotated,
      updateData.qualUnderstanding ?? existing.qualUnderstanding,
    ].filter((s) => s !== null);

    if (qualScores.length > 0) {
      updateData.qualTotal = qualScores.reduce((a, b) => a + b, 0) / qualScores.length;
    }

    if (updateData.comTotal !== undefined && updateData.qualTotal !== undefined) {
      updateData.overallScore = (updateData.comTotal + updateData.qualTotal) / 2;
    }

    const updated = await prisma.performanceRecord.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updated, 'Performance record updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Performance Record
 * DELETE /api/performance/:id
 */
export async function deletePerformanceRecord(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.performanceRecord.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Performance record not found', 404);
    }

    await prisma.performanceRecord.delete({ where: { id } });

    return successResponse(res, null, 'Performance record deleted successfully');
  } catch (error) {
    next(error);
  }
}