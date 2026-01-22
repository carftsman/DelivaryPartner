const express = require("express");
const { createWeeklyBonus  } = require("../controllers/adminIncentiveController");
const adminRouterIncentives = express.Router();

/**
 * @swagger
 * /api/admin/incentives/weekly_bonus:
 *   post:
 *     summary: Create weekly incentive bonus (Admin)
 *     description: Admin API to create a weekly target-based incentive rule for riders.
 *     tags:
 *       - Admin Incentives
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - weeklyRules
 *               - maxRewardPerWeek
 *             properties:
 *               title:
 *                 type: string
 *                 example: Weekly Target Bonus
 *               description:
 *                 type: string
 *                 example: Complete daily order targets throughout the week to earn bonus
 *               weeklyRules:
 *                 type: object
 *                 required:
 *                   - minOrdersPerDay
 *                 properties:
 *                   totalDaysInWeek:
 *                     type: number
 *                     example: 7
 *                   minOrdersPerDay:
 *                     type: number
 *                     example: 10
 *                   allowPartialDays:
 *                     type: boolean
 *                     example: true
 *               maxRewardPerWeek:
 *                 type: number
 *                 example: 500
 *     responses:
 *       201:
 *         description: Weekly bonus rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Weekly bonus rule created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6970ad9c46aa02fad3554ca7
 *                     title:
 *                       type: string
 *                       example: Weekly Target Bonus
 *                     description:
 *                       type: string
 *                       example: Complete daily order targets throughout the week
 *                     incentiveType:
 *                       type: string
 *                       example: WEEKLY_TARGET
 *                     weeklyRules:
 *                       type: object
 *                       properties:
 *                         totalDaysInWeek:
 *                           type: number
 *                           example: 7
 *                         minOrdersPerDay:
 *                           type: number
 *                           example: 10
 *                         allowPartialDays:
 *                           type: boolean
 *                           example: true
 *                     maxRewardPerWeek:
 *                       type: number
 *                       example: 500
 *                     payoutTiming:
 *                       type: string
 *                       example: WEEKLY
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *       400:
 *         description: Validation error (missing or invalid input)
 *       401:
 *         description: Unauthorized – admin token missing or invalid
 *       500:
 *         description: Internal server error
 */

adminRouterIncentives.post("/weekly_bonus",createWeeklyBonus);
// adminRouterIncentives.get("/getWeeklyBonuses",getWeeklyBonuses);

module.exports = adminRouterIncentives;
