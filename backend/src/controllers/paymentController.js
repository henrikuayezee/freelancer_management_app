/**
 * Payment Controller
 * Handles payment record creation, calculation, and management
 */

import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Get All Payment Records (Admin)
 * GET /api/payments
 */
export async function getAllPayments(req, res, next) {
  try {
    const {
      freelancerId,
      status,
      year,
      month,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    if (freelancerId) where.freelancerId = freelancerId;
    if (status) where.status = status;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const validSortFields = ['createdAt', 'totalAmount', 'paidAt', 'year', 'month'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const payments = await prisma.paymentRecord.findMany({
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
            email: true,
          },
        },
        lineItems: {
          include: {
            project: {
              select: {
                projectId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.paymentRecord.count({ where });

    return successResponse(res, {
      payments,
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
 * Get Payment Record by ID
 * GET /api/payments/:id
 */
export async function getPaymentById(req, res, next) {
  try {
    const { id } = req.params;

    const payment = await prisma.paymentRecord.findUnique({
      where: { id },
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
        lineItems: {
          include: {
            project: {
              select: {
                projectId: true,
                name: true,
              },
            },
          },
          orderBy: {
            workDate: 'desc',
          },
        },
      },
    });

    if (!payment) {
      return errorResponse(res, 'Payment record not found', 404);
    }

    return successResponse(res, payment);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Freelancer Payment History (Freelancer Portal)
 * GET /api/payments/freelancer/my-payments
 */
export async function getMyPayments(req, res, next) {
  try {
    const userId = req.user.id;

    // Get freelancer profile
    const freelancer = await prisma.freelancer.findUnique({
      where: { userId },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer profile not found', 404);
    }

    const { year, status } = req.query;
    const where = { freelancerId: freelancer.id };

    if (year) where.year = parseInt(year);
    if (status) where.status = status;

    const payments = await prisma.paymentRecord.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        lineItems: {
          include: {
            project: {
              select: {
                projectId: true,
                name: true,
              },
            },
          },
          orderBy: {
            workDate: 'desc',
          },
        },
      },
    });

    // Calculate summary stats
    const totalPaid = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.totalAmount, 0);

    const totalPending = payments
      .filter((p) => p.status === 'PENDING' || p.status === 'APPROVED')
      .reduce((sum, p) => sum + p.totalAmount, 0);

    return successResponse(res, {
      payments,
      summary: {
        totalPaid,
        totalPending,
        totalPayments: payments.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create Payment Record
 * POST /api/payments
 */
export async function createPaymentRecord(req, res, next) {
  try {
    const {
      freelancerId,
      month,
      year,
      periodStart,
      periodEnd,
      lineItems, // Array of line items
      notes,
    } = req.body;

    // Validation
    if (!freelancerId || !month || !year || !periodStart || !periodEnd) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Check if payment record already exists for this period
    const existing = await prisma.paymentRecord.findUnique({
      where: {
        freelancerId_year_month: {
          freelancerId,
          year: parseInt(year),
          month: parseInt(month),
        },
      },
    });

    if (existing) {
      return errorResponse(res, 'Payment record already exists for this period', 400);
    }

    // Calculate totals from line items
    let totalAmount = 0;
    let totalHours = 0;
    let totalAssets = 0;
    let totalObjects = 0;

    if (lineItems && lineItems.length > 0) {
      lineItems.forEach((item) => {
        totalAmount += item.amount || 0;
        totalHours += item.hoursWorked || 0;
        totalAssets += item.assetsCompleted || 0;
        totalObjects += item.objectsAnnotated || 0;
      });
    }

    // Create payment record with line items
    const payment = await prisma.paymentRecord.create({
      data: {
        freelancerId,
        month: parseInt(month),
        year: parseInt(year),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        hoursWorked: totalHours > 0 ? totalHours : null,
        assetsCompleted: totalAssets > 0 ? totalAssets : null,
        objectsAnnotated: totalObjects > 0 ? totalObjects : null,
        totalAmount,
        notes,
        createdBy: req.user.id,
        lineItems: lineItems && lineItems.length > 0 ? {
          create: lineItems.map((item) => ({
            projectId: item.projectId || null,
            description: item.description,
            workDate: new Date(item.workDate),
            hoursWorked: item.hoursWorked || null,
            assetsCompleted: item.assetsCompleted || null,
            objectsAnnotated: item.objectsAnnotated || null,
            rate: item.rate,
            rateType: item.rateType,
            amount: item.amount,
          })),
        } : undefined,
      },
      include: {
        freelancer: {
          select: {
            freelancerId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lineItems: {
          include: {
            project: {
              select: {
                projectId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return successResponse(res, payment, 'Payment record created successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Payment Record
 * PUT /api/payments/:id
 */
export async function updatePaymentRecord(req, res, next) {
  try {
    const { id } = req.params;
    const {
      status,
      paymentMethod,
      referenceNumber,
      notes,
      internalNotes,
      paidAt,
    } = req.body;

    const existing = await prisma.paymentRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(res, 'Payment record not found', 404);
    }

    // Build update data
    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'APPROVED') {
        updateData.approvedBy = req.user.id;
        updateData.approvedAt = new Date();
      }
      if (status === 'PAID' && !existing.paidAt) {
        updateData.paidAt = paidAt ? new Date(paidAt) : new Date();
      }
    }
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber;
    if (notes !== undefined) updateData.notes = notes;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const updated = await prisma.paymentRecord.update({
      where: { id },
      data: updateData,
      include: {
        freelancer: {
          select: {
            freelancerId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lineItems: {
          include: {
            project: {
              select: {
                projectId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return successResponse(res, updated, 'Payment record updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Payment Record
 * DELETE /api/payments/:id
 */
export async function deletePaymentRecord(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.paymentRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(res, 'Payment record not found', 404);
    }

    // Don't allow deleting paid records
    if (existing.status === 'PAID') {
      return errorResponse(res, 'Cannot delete a paid payment record', 400);
    }

    await prisma.paymentRecord.delete({
      where: { id },
    });

    return successResponse(res, null, 'Payment record deleted successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Calculate Payment for Freelancer
 * POST /api/payments/calculate
 */
export async function calculatePayment(req, res, next) {
  try {
    const { freelancerId, periodStart, periodEnd } = req.body;

    if (!freelancerId || !periodStart || !periodEnd) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    // Get all project assignments for freelancer in this period
    const assignments = await prisma.projectAssignment.findMany({
      where: {
        freelancerId,
        startDate: { lte: end },
        OR: [
          { endDate: { gte: start } },
          { endDate: null },
        ],
      },
      include: {
        project: true,
      },
    });

    // Get performance records in this period
    const performanceRecords = await prisma.performanceRecord.findMany({
      where: {
        freelancerId,
        recordDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        project: true,
      },
    });

    // Calculate line items from performance records
    const lineItems = [];
    let totalAmount = 0;

    for (const record of performanceRecords) {
      if (!record.project) continue;

      const project = record.project;
      let amount = 0;
      let rate = 0;
      let rateType = project.paymentModel;

      // Calculate based on payment model
      if (project.paymentModel === 'HOURLY' && record.hoursWorked) {
        rate = project.hourlyRateAnnotation || 0;
        amount = record.hoursWorked * rate;
      } else if (project.paymentModel === 'PER_ASSET' && record.assetsCompleted) {
        rate = project.perAssetRateAnnotation || 0;
        amount = record.assetsCompleted * rate;
      } else if (project.paymentModel === 'PER_OBJECT' && record.tasksCompleted) {
        rate = project.perObjectRateAnnotation || 0;
        amount = record.tasksCompleted * rate;
      }

      if (amount > 0) {
        lineItems.push({
          projectId: project.id,
          projectName: project.name,
          description: `${project.name} - ${rateType} work`,
          workDate: record.recordDate,
          hoursWorked: record.hoursWorked,
          assetsCompleted: record.assetsCompleted,
          objectsAnnotated: record.tasksCompleted,
          rate,
          rateType,
          amount,
        });
        totalAmount += amount;
      }
    }

    return successResponse(res, {
      freelancerId,
      periodStart: start,
      periodEnd: end,
      lineItems,
      totalAmount,
      month: start.getMonth() + 1,
      year: start.getFullYear(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Payment Statistics
 * GET /api/payments/stats
 */
export async function getPaymentStats(req, res, next) {
  try {
    const { year, month } = req.query;
    const where = {};

    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    // Total payments
    const totalPayments = await prisma.paymentRecord.count({ where });

    // Status breakdown
    const statusBreakdown = await prisma.paymentRecord.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        totalAmount: true,
      },
    });

    // Total amounts
    const allPayments = await prisma.paymentRecord.findMany({
      where,
      select: {
        totalAmount: true,
        status: true,
      },
    });

    const totalAmount = allPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = allPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPending = allPayments
      .filter((p) => p.status === 'PENDING' || p.status === 'APPROVED')
      .reduce((sum, p) => sum + p.totalAmount, 0);

    return successResponse(res, {
      totalPayments,
      totalAmount,
      totalPaid,
      totalPending,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count,
        totalAmount: s._sum.totalAmount || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export Payments to CSV
 * GET /api/payments/export/csv
 */
export async function exportPaymentsCSV(req, res, next) {
  try {
    const { freelancerId, status, year, month } = req.query;
    const where = {};

    if (freelancerId) where.freelancerId = freelancerId;
    if (status) where.status = status;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const payments = await prisma.paymentRecord.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        freelancer: {
          select: {
            freelancerId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lineItems: {
          include: {
            project: {
              select: {
                projectId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Build CSV header
    const csvHeaders = [
      'Payment ID',
      'Freelancer ID',
      'Freelancer Name',
      'Email',
      'Month',
      'Year',
      'Period Start',
      'Period End',
      'Status',
      'Total Amount',
      'Currency',
      'Hours Worked',
      'Assets Completed',
      'Objects Annotated',
      'Payment Method',
      'Reference Number',
      'Paid At',
      'Created At',
      'Notes',
    ];

    // Build CSV rows
    const csvRows = payments.map((payment) => {
      const freelancerName = `${payment.freelancer.firstName} ${payment.freelancer.lastName}`;

      return [
        payment.id,
        payment.freelancer.freelancerId,
        `"${freelancerName}"`,
        payment.freelancer.email,
        payment.month,
        payment.year,
        payment.periodStart.toISOString().split('T')[0],
        payment.periodEnd.toISOString().split('T')[0],
        payment.status,
        payment.totalAmount.toFixed(2),
        payment.currency,
        payment.hoursWorked || '',
        payment.assetsCompleted || '',
        payment.objectsAnnotated || '',
        payment.paymentMethod || '',
        payment.referenceNumber || '',
        payment.paidAt ? payment.paidAt.toISOString().split('T')[0] : '',
        payment.createdAt.toISOString().split('T')[0],
        payment.notes ? `"${payment.notes.replace(/"/g, '""')}"` : '',
      ].join(',');
    });

    // Combine header and rows
    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    // Set response headers for file download
    const filename = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.send(csv);
  } catch (error) {
    next(error);
  }
}

/**
 * Export Payment Line Items to CSV
 * GET /api/payments/export/csv/line-items
 */
export async function exportLineItemsCSV(req, res, next) {
  try {
    const { freelancerId, status, year, month } = req.query;
    const where = {};

    if (freelancerId) where.freelancerId = freelancerId;
    if (status) where.status = status;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const payments = await prisma.paymentRecord.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        freelancer: {
          select: {
            freelancerId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lineItems: {
          include: {
            project: {
              select: {
                projectId: true,
                name: true,
              },
            },
          },
          orderBy: {
            workDate: 'desc',
          },
        },
      },
    });

    // Build CSV header
    const csvHeaders = [
      'Payment ID',
      'Freelancer ID',
      'Freelancer Name',
      'Email',
      'Payment Month',
      'Payment Year',
      'Payment Status',
      'Line Item ID',
      'Project ID',
      'Project Name',
      'Description',
      'Work Date',
      'Hours Worked',
      'Assets Completed',
      'Objects Annotated',
      'Rate',
      'Rate Type',
      'Amount',
    ];

    // Build CSV rows
    const csvRows = [];
    for (const payment of payments) {
      const freelancerName = `${payment.freelancer.firstName} ${payment.freelancer.lastName}`;

      if (payment.lineItems && payment.lineItems.length > 0) {
        for (const item of payment.lineItems) {
          csvRows.push([
            payment.id,
            payment.freelancer.freelancerId,
            `"${freelancerName}"`,
            payment.freelancer.email,
            payment.month,
            payment.year,
            payment.status,
            item.id,
            item.project?.projectId || '',
            item.project?.name ? `"${item.project.name}"` : '',
            `"${item.description.replace(/"/g, '""')}"`,
            item.workDate.toISOString().split('T')[0],
            item.hoursWorked || '',
            item.assetsCompleted || '',
            item.objectsAnnotated || '',
            item.rate.toFixed(2),
            item.rateType,
            item.amount.toFixed(2),
          ].join(','));
        }
      }
    }

    // Combine header and rows
    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    // Set response headers for file download
    const filename = `payment_line_items_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.send(csv);
  } catch (error) {
    next(error);
  }
}
