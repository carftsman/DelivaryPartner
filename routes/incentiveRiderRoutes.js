const express = require("express");
const router = express.Router();

const {
  getDailyIncentive
} = require("../controllers/riderIncentiveController");

const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

/**
 * @swagger
 * /api/rider/incentives/daily:
 *   get:
 *     summary: Get Daily Incentive Status for Rider
 *     description: >
 *       Returns today's delivered order summary and incentive eligibility
 *       based on active DAILY_TARGET incentive rules.
 *       Requires rider authentication token.
 *     tags:
 *       - Rider Incentives
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily incentive status returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Incentive Achieved
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     eligible:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Daily incentive achieved
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: integer
 *                           example: 8
 *                         peakOrders:
 *                           type: integer
 *                           example: 3
 *                         normalOrders:
 *                           type: integer
 *                           example: 5
 *                         orderEarnings:
 *                           type: number
 *                           example: 240
 *                         incentiveEarnings:
 *                           type: number
 *                           example: 150
 *                         totalEarnings:
 *                           type: number
 *                           example: 390
 *                 - type: object
 *                   description: Incentive Not Achieved
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     eligible:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Daily incentive not achieved
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: integer
 *                           example: 4
 *                         peakOrders:
 *                           type: integer
 *                           example: 1
 *                         normalOrders:
 *                           type: integer
 *                           example: 3
 *                         orderEarnings:
 *                           type: number
 *                           example: 120
 *                         incentiveEarnings:
 *                           type: number
 *                           example: 0
 *                         totalEarnings:
 *                           type: number
 *                           example: 120
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized rider
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to calculate earnings
 */


// TOKEN REQUIRED
router.get("/daily", riderAuthMiddleWare, getDailyIncentive);

module.exports = router;
