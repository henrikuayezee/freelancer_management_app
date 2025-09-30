/**
 * Freelancer Controller
 * Handles freelancer profile management and listing
 */

import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Get All Freelancers (Admin/PM only)
 * GET /api/freelancers
 */
export async function getAllFreelancers(req, res, next) {
  try {
    const {
      status,
      tier,
      grade,
      country,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (tier) where.currentTier = tier;
    if (grade) where.currentGrade = grade;
    if (country) where.country = country;

    // Search by name or email
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { freelancerId: { contains: search } },
      ];
    }

    const freelancers = await prisma.freelancer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      select: {
        id: true,
        freelancerId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        status: true,
        onboardingStatus: true,
        currentTier: true,
        currentGrade: true,
        availabilityType: true,
        hoursPerWeek: true,
        createdAt: true,
      },
    });

    const totalCount = await prisma.freelancer.count({ where });

    return successResponse(res, {
      freelancers,
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
 * Get Freelancer by ID (Admin/PM only)
 * GET /api/freelancers/:id
 */
export async function getFreelancerById(req, res, next) {
  try {
    const { id } = req.params;

    const freelancer = await prisma.freelancer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer not found', 404);
    }

    return successResponse(res, freelancer);
  } catch (error) {
    next(error);
  }
}