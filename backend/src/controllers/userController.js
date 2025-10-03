/**
 * User Management Controller
 * Handles user account management (admin only)
 */

import bcrypt from 'bcrypt';
import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Get All Users
 * GET /api/users
 */
export async function getAllUsers(req, res, next) {
  try {
    const { role, isActive, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.email = { contains: search };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        freelancer: {
          select: {
            id: true,
            freelancerId: true,
            firstName: true,
            lastName: true,
            status: true,
            currentTier: true,
            currentGrade: true,
          },
        },
        adminProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, users);
  } catch (error) {
    next(error);
  }
}

/**
 * Get User Stats
 * GET /api/users/stats
 */
export async function getUserStats(req, res, next) {
  try {
    const total = await prisma.user.count();
    const active = await prisma.user.count({ where: { isActive: true } });
    const inactive = await prisma.user.count({ where: { isActive: false } });

    const byRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const roleStats = {};
    byRole.forEach((item) => {
      roleStats[item.role] = item._count;
    });

    return successResponse(res, {
      total,
      active,
      inactive,
      byRole: roleStats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update User Role
 * PUT /api/users/:id/role
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return errorResponse(res, 'Role is required', 400);
    }

    const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'TRAINING_LEAD', 'QA', 'FINANCE', 'FREELANCER'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return successResponse(res, updated, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle User Active Status
 * PUT /api/users/:id/toggle-active
 */
export async function toggleUserActive(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent deactivating yourself
    if (user.id === req.user.id) {
      return errorResponse(res, 'You cannot deactivate your own account', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return successResponse(
      res,
      updated,
      `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Delete User
 * DELETE /api/users/:id
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return errorResponse(res, 'You cannot delete your own account', 400);
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({ where: { id } });

    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Reset User Password
 * POST /api/users/:id/reset-password
 */
export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // If newPassword provided, use it; otherwise generate one
    const password = newPassword || `Aya${Math.random().toString(36).slice(-8)}!`;
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return successResponse(
      res,
      { email: user.email, temporaryPassword: password },
      'Password reset successfully'
    );
  } catch (error) {
    next(error);
  }
}