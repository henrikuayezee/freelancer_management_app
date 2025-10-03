/**
 * Tiering Controller
 * Handles tier and grade calculations and updates
 */

import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../utils/prisma.js';

/**
 * Tiering Logic:
 * - TIERS: PLATINUM, GOLD, SILVER, BRONZE
 * - GRADES: A, B, C
 * - Based on average performance scores (COM + QUAL)
 *
 * Tier Calculation (based on overall score average):
 * - PLATINUM: >= 4.5
 * - GOLD: >= 3.5 and < 4.5
 * - SILVER: >= 2.5 and < 3.5
 * - BRONZE: < 2.5
 *
 * Grade Calculation (within tier, based on consistency):
 * - A: Top 33% (consistent high performance)
 * - B: Middle 34% (moderate consistency)
 * - C: Bottom 33% (needs improvement)
 */

/**
 * Calculate Tier and Grade for a Freelancer
 * POST /api/tiering/calculate/:freelancerId
 */
export async function calculateTierGrade(req, res, next) {
  try {
    const { freelancerId } = req.params;
    const { period } = req.query; // Optional: 'last_month', 'last_quarter', 'all'

    const freelancer = await prisma.freelancer.findUnique({
      where: { id: freelancerId },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer not found', 404);
    }

    // Get performance records
    const where = { freelancerId };
    if (period === 'last_month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      where.recordDate = { gte: lastMonth };
    } else if (period === 'last_quarter') {
      const lastQuarter = new Date();
      lastQuarter.setMonth(lastQuarter.getMonth() - 3);
      where.recordDate = { gte: lastQuarter };
    }

    const records = await prisma.performanceRecord.findMany({
      where,
      orderBy: { recordDate: 'desc' },
    });

    if (records.length === 0) {
      return errorResponse(res, 'No performance records found for this freelancer', 400);
    }

    // Calculate average overall score
    const scoresWithValues = records.filter((r) => r.overallScore !== null);
    if (scoresWithValues.length === 0) {
      return errorResponse(res, 'No valid performance scores found', 400);
    }

    const avgScore = scoresWithValues.reduce((sum, r) => sum + r.overallScore, 0) / scoresWithValues.length;

    // Calculate consistency (standard deviation)
    const variance = scoresWithValues.reduce((sum, r) => sum + Math.pow(r.overallScore - avgScore, 2), 0) / scoresWithValues.length;
    const stdDev = Math.sqrt(variance);
    const consistency = 1 - Math.min(stdDev / avgScore, 1); // 0 to 1, higher is better

    // Determine tier based on average score
    let newTier;
    if (avgScore >= 4.5) {
      newTier = 'PLATINUM';
    } else if (avgScore >= 3.5) {
      newTier = 'GOLD';
    } else if (avgScore >= 2.5) {
      newTier = 'SILVER';
    } else {
      newTier = 'BRONZE';
    }

    // Determine grade based on consistency
    let newGrade;
    if (consistency >= 0.75) {
      newGrade = 'A';
    } else if (consistency >= 0.5) {
      newGrade = 'B';
    } else {
      newGrade = 'C';
    }

    const oldTier = freelancer.currentTier;
    const oldGrade = freelancer.currentGrade;

    const changed = oldTier !== newTier || oldGrade !== newGrade;

    return successResponse(res, {
      freelancerId,
      calculation: {
        avgScore: avgScore.toFixed(2),
        consistency: consistency.toFixed(2),
        recordsAnalyzed: scoresWithValues.length,
        period: period || 'all',
      },
      current: {
        tier: oldTier,
        grade: oldGrade,
      },
      recommended: {
        tier: newTier,
        grade: newGrade,
      },
      changed,
      message: changed
        ? `Tier/Grade changed from ${oldTier}-${oldGrade} to ${newTier}-${newGrade}`
        : 'No change in tier/grade',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Apply Calculated Tier and Grade
 * PUT /api/tiering/apply/:freelancerId
 */
export async function applyTierGrade(req, res, next) {
  try {
    const { freelancerId } = req.params;
    const { tier, grade, reason } = req.body;

    if (!tier || !grade) {
      return errorResponse(res, 'Tier and grade are required', 400);
    }

    const validTiers = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];
    const validGrades = ['A', 'B', 'C'];

    if (!validTiers.includes(tier) || !validGrades.includes(grade)) {
      return errorResponse(res, 'Invalid tier or grade', 400);
    }

    const freelancer = await prisma.freelancer.findUnique({
      where: { id: freelancerId },
    });

    if (!freelancer) {
      return errorResponse(res, 'Freelancer not found', 404);
    }

    const oldTier = freelancer.currentTier;
    const oldGrade = freelancer.currentGrade;

    // Update freelancer tier and grade
    const updated = await prisma.freelancer.update({
      where: { id: freelancerId },
      data: {
        currentTier: tier,
        currentGrade: grade,
      },
    });

    // Create history record (we'll add this model if needed)
    // For now, just return the update

    return successResponse(res, {
      freelancer: updated,
      change: {
        from: `${oldTier}-${oldGrade}`,
        to: `${tier}-${grade}`,
        changedBy: req.user.id,
        reason: reason || 'Performance-based update',
      },
    }, 'Tier and grade updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk Calculate Tiers and Grades for All Freelancers
 * POST /api/tiering/calculate-all
 */
export async function calculateAllTierGrades(req, res, next) {
  try {
    const { period, autoApply } = req.body;

    const freelancers = await prisma.freelancer.findMany({
      where: { status: 'ACTIVE' },
    });

    const results = [];

    for (const freelancer of freelancers) {
      try {
        // Get performance records
        const where = { freelancerId: freelancer.id };
        if (period === 'last_month') {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          where.recordDate = { gte: lastMonth };
        } else if (period === 'last_quarter') {
          const lastQuarter = new Date();
          lastQuarter.setMonth(lastQuarter.getMonth() - 3);
          where.recordDate = { gte: lastQuarter };
        }

        const records = await prisma.performanceRecord.findMany({
          where,
        });

        if (records.length === 0) {
          results.push({
            freelancerId: freelancer.id,
            name: `${freelancer.firstName} ${freelancer.lastName}`,
            status: 'skipped',
            reason: 'No performance records',
          });
          continue;
        }

        const scoresWithValues = records.filter((r) => r.overallScore !== null);
        if (scoresWithValues.length === 0) {
          results.push({
            freelancerId: freelancer.id,
            name: `${freelancer.firstName} ${freelancer.lastName}`,
            status: 'skipped',
            reason: 'No valid scores',
          });
          continue;
        }

        const avgScore = scoresWithValues.reduce((sum, r) => sum + r.overallScore, 0) / scoresWithValues.length;
        const variance = scoresWithValues.reduce((sum, r) => sum + Math.pow(r.overallScore - avgScore, 2), 0) / scoresWithValues.length;
        const stdDev = Math.sqrt(variance);
        const consistency = 1 - Math.min(stdDev / avgScore, 1);

        let newTier;
        if (avgScore >= 4.5) newTier = 'PLATINUM';
        else if (avgScore >= 3.5) newTier = 'GOLD';
        else if (avgScore >= 2.5) newTier = 'SILVER';
        else newTier = 'BRONZE';

        let newGrade;
        if (consistency >= 0.75) newGrade = 'A';
        else if (consistency >= 0.5) newGrade = 'B';
        else newGrade = 'C';

        const changed = freelancer.currentTier !== newTier || freelancer.currentGrade !== newGrade;

        if (autoApply && changed) {
          await prisma.freelancer.update({
            where: { id: freelancer.id },
            data: {
              currentTier: newTier,
              currentGrade: newGrade,
            },
          });
        }

        results.push({
          freelancerId: freelancer.id,
          name: `${freelancer.firstName} ${freelancer.lastName}`,
          status: changed ? (autoApply ? 'updated' : 'change_detected') : 'no_change',
          from: `${freelancer.currentTier}-${freelancer.currentGrade}`,
          to: `${newTier}-${newGrade}`,
          avgScore: avgScore.toFixed(2),
          consistency: consistency.toFixed(2),
        });
      } catch (error) {
        results.push({
          freelancerId: freelancer.id,
          name: `${freelancer.firstName} ${freelancer.lastName}`,
          status: 'error',
          error: error.message,
        });
      }
    }

    const summary = {
      total: results.length,
      updated: results.filter((r) => r.status === 'updated').length,
      changesDetected: results.filter((r) => r.status === 'change_detected').length,
      noChange: results.filter((r) => r.status === 'no_change').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      errors: results.filter((r) => r.status === 'error').length,
    };

    return successResponse(res, {
      summary,
      results,
    }, `Bulk calculation completed. ${summary.updated} freelancers updated.`);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Tier Distribution Stats
 * GET /api/tiering/stats
 */
export async function getTierStats(req, res, next) {
  try {
    const freelancers = await prisma.freelancer.findMany({
      where: { status: 'ACTIVE' },
      select: {
        currentTier: true,
        currentGrade: true,
      },
    });

    const tierCounts = {
      PLATINUM: 0,
      GOLD: 0,
      SILVER: 0,
      BRONZE: 0,
    };

    const gradeCounts = {
      A: 0,
      B: 0,
      C: 0,
    };

    const tierGradeCounts = {};

    freelancers.forEach((fl) => {
      tierCounts[fl.currentTier]++;
      gradeCounts[fl.currentGrade]++;

      const key = `${fl.currentTier}-${fl.currentGrade}`;
      tierGradeCounts[key] = (tierGradeCounts[key] || 0) + 1;
    });

    return successResponse(res, {
      total: freelancers.length,
      byTier: tierCounts,
      byGrade: gradeCounts,
      byTierGrade: tierGradeCounts,
    });
  } catch (error) {
    next(error);
  }
}