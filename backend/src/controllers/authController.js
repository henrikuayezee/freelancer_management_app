/**
 * Authentication Controller
 * Handles user login, registration, and token management
 */

import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Login
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        adminProfile: true,
        freelancer: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Prepare user data (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.adminProfile || user.freelancer || null,
    };

    return successResponse(
      res,
      {
        user: userData,
        accessToken,
        refreshToken,
      },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get Current User
 * GET /api/auth/me
 * Requires authentication
 */
export async function getCurrentUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        adminProfile: true,
        freelancer: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        adminProfile: true,
        freelancer: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Logout
 * POST /api/auth/logout
 * (Client-side will remove tokens)
 */
export async function logout(req, res, next) {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Server just acknowledges the request
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}