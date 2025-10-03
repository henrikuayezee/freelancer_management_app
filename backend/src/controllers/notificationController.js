/**
 * Notification Controller
 * Handles in-app notifications for users
 */

import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Get All Notifications for current user
 * GET /api/notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    const where = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    return successResponse(res, notifications);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Unread Count
 * GET /api/notifications/unread-count
 */
export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return successResponse(res, { count });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark Notification as Read
 * PUT /api/notifications/:id/read
 */
export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
}

/**
 * Mark All Notifications as Read
 * PUT /api/notifications/read-all
 */
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Notification
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    await prisma.notification.delete({
      where: { id },
    });

    return successResponse(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
}

/**
 * Create Notification (Internal use - called by other controllers)
 * This function is not exposed as an API endpoint
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link = null,
  relatedId = null,
  relatedType = null,
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        relatedId,
        relatedType,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
