/**
 * Freelancer Application Controller
 * Handles application submissions and approvals
 */

import bcrypt from 'bcrypt';
import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';
import { createNotification } from './notificationController.js';
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from '../services/emailService.js';

/**
 * Submit Application (Public endpoint)
 * POST /api/applications
 */
export async function submitApplication(req, res, next) {
  try {
    const formData = req.body;

    // Extract required fields
    const { email, firstName, lastName, phone } = formData;

    // Basic validation - only require core fields
    if (!email || !firstName || !lastName || !phone) {
      return errorResponse(res, 'Required fields are missing (email, firstName, lastName, phone)', 400);
    }

    // Check if email already exists in applications or users
    const existingApplication = await prisma.freelancerApplication.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingApplication) {
      return errorResponse(res, 'An application with this email already exists', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return errorResponse(res, 'This email is already registered', 400);
    }

    // Store entire form data as JSON
    const application = await prisma.freelancerApplication.create({
      data: {
        // Core fields
        email: email.toLowerCase().trim(),
        firstName,
        lastName,
        phone,

        // Store all form data as JSON for flexibility
        formData: JSON.stringify(formData),

        // Legacy fields for backward compatibility (extract from formData if exists)
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.city || null,
        country: formData.country || null,
        gender: formData.gender || null,
        timezone: formData.timezone || null,
        educationLevel: formData.educationLevel || null,
        degreeName: formData.degreeName || null,
        educationInstitution: formData.educationInstitution || null,
        hasLaptop: formData.hasLaptop === true || formData.hasLaptop === 'true',
        hasReliableInternet: formData.hasReliableInternet === true || formData.hasReliableInternet === 'true',
        remoteWorkAvailable: formData.remoteWorkAvailable === true || formData.remoteWorkAvailable === 'true',
        employmentStatus: formData.employmentStatus || null,
        preferredStartTime: formData.preferredStartTime || null,
        preferredEndTime: formData.preferredEndTime || null,
        availabilityType: formData.availabilityType || null,
        hoursPerWeek: formData.hoursPerWeek ? parseInt(formData.hoursPerWeek) : null,
        interestedLongTerm: formData.interestedLongTerm === true || formData.interestedLongTerm === 'true',
        relevantExperience: formData.relevantExperience || null,
        yearsOfExperience: formData.yearsOfExperience ? parseFloat(formData.yearsOfExperience) : null,
        previousCompanies: formData.previousCompanies || null,
        annotationTypes: formData.annotationTypes ? JSON.stringify(formData.annotationTypes) : null,
        annotationMethods: formData.annotationMethods ? JSON.stringify(formData.annotationMethods) : null,
        annotationTools: formData.annotationTools ? JSON.stringify(formData.annotationTools) : null,
        strongestTool: formData.strongestTool || null,
        languageProficiency: formData.languageProficiency ? JSON.stringify(formData.languageProficiency) : null,
        hasTrainedOthers: formData.hasTrainedOthers === true || formData.hasTrainedOthers === 'true',
        complexTaskDescription: formData.complexTaskDescription || null,
        howHeardAbout: formData.howHeardAbout || null,

        status: 'PENDING',
      },
    });

    return successResponse(
      res,
      { applicationId: application.id },
      'Application submitted successfully. We will review it and contact you soon!',
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get All Applications (Admin only)
 * GET /api/applications
 */
export async function getAllApplications(req, res, next) {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const applications = await prisma.freelancerApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    // Parse formData JSON for each application
    const applicationsWithParsedData = applications.map(app => ({
      ...app,
      formDataParsed: app.formData ? JSON.parse(app.formData) : null
    }));

    const totalCount = await prisma.freelancerApplication.count({ where });

    return successResponse(res, {
      applications: applicationsWithParsedData,
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
 * Get Single Application (Admin only)
 * GET /api/applications/:id
 */
export async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;

    const application = await prisma.freelancerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }

    return successResponse(res, application);
  } catch (error) {
    next(error);
  }
}

/**
 * Approve Application (Admin only)
 * POST /api/applications/:id/approve
 */
export async function approveApplication(req, res, next) {
  try {
    const { id } = req.params;

    // Get application
    const application = await prisma.freelancerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }

    if (application.status !== 'PENDING') {
      return errorResponse(res, 'Application has already been reviewed', 400);
    }

    // Generate default password (they'll change it on first login)
    const defaultPassword = `Aya${Math.random().toString(36).slice(-8)}!`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Generate unique freelancer ID
    const freelancerCount = await prisma.freelancer.count();
    const freelancerId = `FL-${String(freelancerCount + 1).padStart(4, '0')}`;

    // Create user, freelancer profile, and update application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      await tx.freelancerApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      });

      // Create user account
      const user = await tx.user.create({
        data: {
          email: application.email,
          password: hashedPassword,
          role: 'FREELANCER',
          isActive: true,
        },
      });

      // Create freelancer profile
      const freelancer = await tx.freelancer.create({
        data: {
          freelancerId,
          userId: user.id,
          applicationId: application.id,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          phone: application.phone,
          city: application.city,
          country: application.country,
          timezone: application.timezone,
          gender: application.gender,
          age: application.age,
          domainExpertise: '[]',
          annotationTypes: application.annotationTypes,
          annotationMethods: application.annotationMethods,
          toolsProficiency: application.annotationTools,
          languageProficiency: application.languageProficiency,
          availabilityType: application.availabilityType,
          hoursPerWeek: application.hoursPerWeek,
          preferredStartTime: application.preferredStartTime,
          preferredEndTime: application.preferredEndTime,
          status: 'ACTIVE',
          onboardingStatus: 'PENDING',
          currentTier: 'BRONZE',
          currentGrade: 'C',
        },
      });

      return { user, freelancer };
    });

    // Create notification for approved freelancer
    await createNotification({
      userId: result.user.id,
      type: 'APPLICATION_APPROVED',
      title: 'Application Approved!',
      message: `Congratulations ${application.firstName}! Your freelancer application has been approved. You can now log in with your credentials.`,
      link: '/freelancer',
      relatedId: application.id,
      relatedType: 'APPLICATION',
    });

    // Send approval email with credentials
    await sendApplicationApprovedEmail({
      email: application.email,
      firstName: application.firstName,
      temporaryPassword: defaultPassword,
    });

    // TODO: Auto-invite to Slack

    return successResponse(
      res,
      {
        freelancerId: result.freelancer.freelancerId,
        email: application.email,
        temporaryPassword: defaultPassword, // Send via email in production
      },
      'Application approved successfully'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Reject Application (Admin only)
 * POST /api/applications/:id/reject
 */
export async function rejectApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get application
    const application = await prisma.freelancerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }

    if (application.status !== 'PENDING') {
      return errorResponse(res, 'Application has already been reviewed', 400);
    }

    // Update application
    await prisma.freelancerApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        rejectionReason: reason || 'Application did not meet requirements',
      },
    });

    // Send rejection email
    await sendApplicationRejectedEmail({
      email: application.email,
      firstName: application.firstName,
      reason: reason || 'Application did not meet requirements',
    });

    return successResponse(res, null, 'Application rejected');
  } catch (error) {
    next(error);
  }
}