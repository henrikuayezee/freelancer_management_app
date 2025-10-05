/**
 * Freelancer Controller
 * Handles freelancer profile management and listing
 */

import bcrypt from 'bcrypt';
import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Get All Freelancers (Admin/PM only)
 * GET /api/freelancers
 * Enhanced with advanced search and filtering
 */
export async function getAllFreelancers(req, res, next) {
  try {
    const {
      status,
      tier,
      grade,
      country,
      city,
      onboardingStatus,
      availabilityType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    // Exact match filters
    if (status) where.status = status;
    if (tier) where.currentTier = tier;
    if (grade) where.currentGrade = grade;
    if (country) where.country = country;
    if (city) where.city = city;
    if (onboardingStatus) where.onboardingStatus = onboardingStatus;
    if (availabilityType) where.availabilityType = availabilityType;

    // Search across multiple fields
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { freelancerId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    // Dynamic sorting
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'currentTier', 'currentGrade'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const freelancers = await prisma.freelancer.findMany({
      where,
      orderBy: { [orderByField]: orderByDirection },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      select: {
        id: true,
        freelancerId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        timezone: true,
        status: true,
        onboardingStatus: true,
        currentTier: true,
        currentGrade: true,
        availabilityType: true,
        hoursPerWeek: true,
        isAvailableNow: true,
        availabilityTimezone: true,
        annotationTypes: true,
        annotationMethods: true,
        toolsProficiency: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    const totalCount = await prisma.freelancer.count({ where });

    // Get unique values for filters (for frontend dropdowns)
    const filterOptions = await getFilterOptions();

    return successResponse(res, {
      freelancers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
      filterOptions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get filter options (unique values for dropdowns)
 * Helper function for advanced filtering
 */
async function getFilterOptions() {
  try {
    const freelancers = await prisma.freelancer.findMany({
      select: {
        country: true,
        city: true,
        status: true,
        currentTier: true,
        currentGrade: true,
        onboardingStatus: true,
        availabilityType: true,
      },
    });

    const unique = (arr) => [...new Set(arr.filter(Boolean))];

    return {
      countries: unique(freelancers.map((f) => f.country)).sort(),
      cities: unique(freelancers.map((f) => f.city)).sort(),
      statuses: ['ACTIVE', 'ENGAGED', 'INACTIVE', 'DEACTIVATED'],
      tiers: ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'],
      grades: ['A', 'B', 'C'],
      onboardingStatuses: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
      availabilityTypes: unique(freelancers.map((f) => f.availabilityType)).sort(),
    };
  } catch (error) {
    return {};
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
        application: {
          select: {
            relevantExperience: true,
            yearsOfExperience: true,
            previousCompanies: true,
            howHeardAbout: true,
            submittedAt: true,
          },
        },
        projectAssignments: {
          include: {
            project: {
              select: {
                id: true,
                projectId: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
        },
        performanceRecords: {
          include: {
            project: {
              select: {
                id: true,
                projectId: true,
                name: true,
              },
            },
          },
          orderBy: {
            recordDate: 'desc',
          },
        },
      },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer not found', 404);
    }

    // Calculate stats
    const totalProjects = freelancer.projectAssignments.length;
    const activeProjects = freelancer.projectAssignments.filter(
      (pa) => pa.status === 'ACTIVE' && pa.project.status === 'ACTIVE'
    ).length;
    const pendingApplications = freelancer.projectAssignments.filter(
      (pa) => pa.status === 'PENDING'
    ).length;

    const avgPerformance =
      freelancer.performanceRecords.length > 0
        ? (
            freelancer.performanceRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
            freelancer.performanceRecords.length
          ).toFixed(2)
        : 0;

    return successResponse(res, {
      ...freelancer,
      stats: {
        totalProjects,
        activeProjects,
        pendingApplications,
        avgPerformance,
        totalPerformanceRecords: freelancer.performanceRecords.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Freelancer (Admin/PM only)
 * PUT /api/freelancers/:id
 */
export async function updateFreelancer(req, res, next) {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      city,
      country,
      timezone,
      status,
      currentTier,
      currentGrade,
      onboardingStatus,
      availabilityType,
      hoursPerWeek,
      performanceTags,
      domainExpertise,
      annotationTypes,
      annotationMethods,
      toolsProficiency,
      languageProficiency,
    } = req.body;

    // Check if freelancer exists
    const existing = await prisma.freelancer.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(res, 'Freelancer not found', 404);
    }

    // Build update data (only include provided fields)
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (status !== undefined) updateData.status = status;
    if (currentTier !== undefined) updateData.currentTier = currentTier;
    if (currentGrade !== undefined) updateData.currentGrade = currentGrade;
    if (onboardingStatus !== undefined) updateData.onboardingStatus = onboardingStatus;
    if (availabilityType !== undefined) updateData.availabilityType = availabilityType;
    if (hoursPerWeek !== undefined) updateData.hoursPerWeek = parseInt(hoursPerWeek);
    if (performanceTags !== undefined) updateData.performanceTags = JSON.stringify(performanceTags);
    if (domainExpertise !== undefined) updateData.domainExpertise = JSON.stringify(domainExpertise);
    if (annotationTypes !== undefined) updateData.annotationTypes = JSON.stringify(annotationTypes);
    if (annotationMethods !== undefined) updateData.annotationMethods = JSON.stringify(annotationMethods);
    if (toolsProficiency !== undefined) updateData.toolsProficiency = JSON.stringify(toolsProficiency);
    if (languageProficiency !== undefined) updateData.languageProficiency = JSON.stringify(languageProficiency);

    // Update freelancer
    const updated = await prisma.freelancer.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updated, 'Freelancer updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Export Freelancers to CSV
 * GET /api/freelancers/export/csv
 */
export async function exportFreelancersCSV(req, res, next) {
  try {
    // Use same filters as list endpoint
    const { status, tier, grade, country, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (tier) where.currentTier = tier;
    if (grade) where.currentGrade = grade;
    if (country) where.country = country;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { freelancerId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const freelancers = await prisma.freelancer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV format
    const headers = [
      'Freelancer ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'City',
      'Country',
      'Status',
      'Tier',
      'Grade',
      'Onboarding Status',
      'Availability',
      'Hours/Week',
      'Created At',
    ];

    const rows = freelancers.map((f) => [
      f.freelancerId,
      f.firstName,
      f.lastName,
      f.email,
      f.phone,
      f.city,
      f.country,
      f.status,
      f.currentTier,
      f.currentGrade,
      f.onboardingStatus,
      f.availabilityType || '',
      f.hoursPerWeek || '',
      new Date(f.createdAt).toISOString().split('T')[0],
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="freelancers-${Date.now()}.csv"`);

    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
}

/**
 * Import Freelancers from CSV
 * POST /api/freelancers/import/csv
 */
export async function importFreelancersCSV(req, res, next) {
  try {
    const { csvData } = req.body;

    if (!csvData || !Array.isArray(csvData)) {
      return errorResponse(res, 'Invalid CSV data format', 400);
    }

    const results = {
      total: csvData.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        // Validate required fields
        if (!row.email || !row.firstName || !row.lastName) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            email: row.email || 'N/A',
            error: 'Missing required fields (email, firstName, lastName)',
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: row.email },
        });

        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            email: row.email,
            error: 'User with this email already exists',
          });
          continue;
        }

        // Create user account (with random password - admin should reset)
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        const user = await prisma.user.create({
          data: {
            email: row.email,
            password: hashedPassword,
            role: 'FREELANCER',
          },
        });

        // Generate freelancer ID
        const count = await prisma.freelancer.count();
        const freelancerId = `FL${String(count + 1).padStart(5, '0')}`;

        // Parse JSON fields if they are strings
        const parseJSON = (field) => {
          if (!field) return null;
          if (typeof field === 'string') {
            try {
              return JSON.stringify(JSON.parse(field));
            } catch {
              return field;
            }
          }
          return JSON.stringify(field);
        };

        // Create freelancer profile
        await prisma.freelancer.create({
          data: {
            userId: user.id,
            freelancerId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || null,
            city: row.city || null,
            country: row.country || null,
            timezone: row.timezone || null,
            status: row.status || 'ACTIVE',
            currentTier: row.currentTier || row.tier || 'BRONZE',
            currentGrade: row.currentGrade || row.grade || 'C',
            onboardingStatus: row.onboardingStatus || 'PENDING',
            availabilityType: row.availabilityType || row.availability || null,
            hoursPerWeek: row.hoursPerWeek ? parseInt(row.hoursPerWeek) : null,
            performanceTags: parseJSON(row.performanceTags),
            domainExpertise: parseJSON(row.domainExpertise),
            annotationTypes: parseJSON(row.annotationTypes),
            annotationMethods: parseJSON(row.annotationMethods),
            toolsProficiency: parseJSON(row.toolsProficiency),
            languageProficiency: parseJSON(row.languageProficiency),
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          email: row.email || 'N/A',
          error: error.message || 'Unknown error',
        });
      }
    }

    return successResponse(
      res,
      results,
      `Import completed: ${results.success} succeeded, ${results.failed} failed`
    );
  } catch (error) {
    next(error);
  }
}