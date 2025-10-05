/**
 * Dashboard Controller
 * Handles admin dashboard statistics and analytics
 */

import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responses.js';

const prisma = new PrismaClient();

/**
 * Get comprehensive dashboard statistics
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Total freelancers (all that have signed up)
    const totalFreelancers = await prisma.freelancer.count();

    // Get freelancers with active project assignments (Engaged)
    const freelancersWithActiveProjects = await prisma.freelancer.findMany({
      where: {
        status: 'ACTIVE',
        projectAssignments: {
          some: {
            status: 'ACTIVE',
            project: {
              status: 'ACTIVE'
            }
          }
        }
      },
      select: {
        id: true
      }
    });

    const engagedFreelancerIds = new Set(freelancersWithActiveProjects.map(f => f.id));
    const engagedFreelancers = engagedFreelancerIds.size;

    // Active freelancers = available but NOT engaged in projects
    const activeFreelancers = await prisma.freelancer.count({
      where: {
        status: 'ACTIVE',
        isAvailableNow: true,
        id: {
          notIn: Array.from(engagedFreelancerIds)
        }
      }
    });

    // Workforce levels (tier breakdown)
    const tierBreakdown = await prisma.freelancer.groupBy({
      by: ['currentTier'],
      _count: {
        currentTier: true
      }
    });

    const workforceLevels = {
      PLATINUM: tierBreakdown.find(t => t.currentTier === 'PLATINUM')?._count?.currentTier || 0,
      GOLD: tierBreakdown.find(t => t.currentTier === 'GOLD')?._count?.currentTier || 0,
      SILVER: tierBreakdown.find(t => t.currentTier === 'SILVER')?._count?.currentTier || 0,
      BRONZE: tierBreakdown.find(t => t.currentTier === 'BRONZE')?._count?.currentTier || 0
    };

    // Country breakdown
    const countryBreakdown = await prisma.freelancer.groupBy({
      by: ['country'],
      _count: {
        country: true
      },
      orderBy: {
        _count: {
          country: 'desc'
        }
      }
    });

    // Gender breakdown
    const genderBreakdown = await prisma.freelancer.groupBy({
      by: ['gender'],
      _count: {
        gender: true
      }
    });

    // Annotation expertise by type
    // We'll need to parse the JSON fields
    const freelancersWithTypes = await prisma.freelancer.findMany({
      select: {
        annotationTypes: true
      }
    });

    const annotationTypeCount = {};
    freelancersWithTypes.forEach(f => {
      if (f.annotationTypes) {
        try {
          const types = JSON.parse(f.annotationTypes);
          if (Array.isArray(types)) {
            types.forEach(type => {
              annotationTypeCount[type] = (annotationTypeCount[type] || 0) + 1;
            });
          }
        } catch (e) {
          // Skip if JSON parsing fails
        }
      }
    });

    // Annotation experience by method
    const freelancersWithMethods = await prisma.freelancer.findMany({
      select: {
        annotationMethods: true
      }
    });

    const annotationMethodCount = {};
    freelancersWithMethods.forEach(f => {
      if (f.annotationMethods) {
        try {
          const methods = JSON.parse(f.annotationMethods);
          if (Array.isArray(methods)) {
            methods.forEach(method => {
              annotationMethodCount[method] = (annotationMethodCount[method] || 0) + 1;
            });
          }
        } catch (e) {
          // Skip if JSON parsing fails
        }
      }
    });

    // Projects count
    const totalProjects = await prisma.project.count();
    const ongoingProjects = await prisma.project.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Format the response
    const stats = {
      overview: {
        totalFreelancers,
        activeFreelancers,
        engagedFreelancers,
        totalProjects,
        ongoingProjects
      },
      workforceLevels,
      countryBreakdown: countryBreakdown.map(c => ({
        country: c.country,
        count: c._count.country
      })),
      genderBreakdown: genderBreakdown
        .filter(g => g.gender) // Filter out null/undefined
        .map(g => ({
          gender: g.gender,
          count: g._count.gender
        })),
      annotationExpertise: {
        byType: Object.entries(annotationTypeCount).map(([type, count]) => ({
          type,
          count
        })),
        byMethod: Object.entries(annotationMethodCount).map(([method, count]) => ({
          method,
          count
        }))
      }
    };

    return successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return errorResponse(res, 'Failed to fetch dashboard statistics', 500);
  }
};

/**
 * Get freelancer performance overview
 * GET /api/dashboard/performance-overview
 */
export const getPerformanceOverview = async (req, res) => {
  try {
    // Get recent performance records
    const recentPerformance = await prisma.performanceRecord.findMany({
      take: 10,
      orderBy: {
        recordDate: 'desc'
      },
      include: {
        freelancer: {
          select: {
            firstName: true,
            lastName: true,
            freelancerId: true
          }
        },
        project: {
          select: {
            name: true,
            projectId: true
          }
        }
      }
    });

    // Average performance scores
    const avgScores = await prisma.performanceRecord.aggregate({
      _avg: {
        overallScore: true,
        qualTotal: true,
        comTotal: true
      }
    });

    return successResponse(res, {
      recentRecords: recentPerformance,
      averages: {
        overall: avgScores._avg.overallScore || 0,
        quality: avgScores._avg.qualTotal || 0,
        communication: avgScores._avg.comTotal || 0
      }
    }, 'Performance overview retrieved successfully');
  } catch (error) {
    console.error('Error fetching performance overview:', error);
    return errorResponse(res, 'Failed to fetch performance overview', 500);
  }
};

/**
 * Get payment statistics
 * GET /api/dashboard/payment-stats
 */
export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await prisma.paymentRecord.aggregate({
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const paidAmount = await prisma.paymentRecord.aggregate({
      where: {
        status: 'PAID'
      },
      _sum: {
        totalAmount: true
      }
    });

    const pendingAmount = await prisma.paymentRecord.aggregate({
      where: {
        status: 'PENDING'
      },
      _sum: {
        totalAmount: true
      }
    });

    return successResponse(res, {
      totalAmount: totalPayments._sum.totalAmount || 0,
      paidAmount: paidAmount._sum.totalAmount || 0,
      pendingAmount: pendingAmount._sum.totalAmount || 0,
      totalRecords: totalPayments._count.id
    }, 'Payment statistics retrieved successfully');
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return errorResponse(res, 'Failed to fetch payment statistics', 500);
  }
};
