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
 *       Returns daily incentive eligibility and reward amount based on
 *       rider completed orders. Requires rider authentication token.
 *     tags:
 *       - Rider Incentives
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ordersCompleted
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12
 *         description: Total completed orders for today
 *     responses:
 *       200:
 *         description: Incentive status returned successfully
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
 *                         riderId:
 *                           type: string
 *                           example: 65fd9812abc
 *                         incentiveId:
 *                           type: string
 *                           example: 65fa77abc12
 *                         title:
 *                           type: string
 *                           example: Daily Target Bonus
 *                         ordersCompleted:
 *                           type: integer
 *                           example: 12
 *                         rewardAmount:
 *                           type: number
 *                           example: 200
 *                         payoutTiming:
 *                           type: string
 *                           example: POST_SLOT
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
 *                       example: Daily target not achieved
 *                     data:
 *                       type: object
 *                       properties:
 *                         riderId:
 *                           type: string
 *                           example: 65fd9812abc
 *                         ordersCompleted:
 *                           type: integer
 *                           example: 5
 *                         rewardAmount:
 *                           type: number
 *                           example: 0
 *       400:
 *         description: Missing or invalid ordersCompleted
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
 *                   example: ordersCompleted is required
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
 *                   example: Authorization token missing
 *       404:
 *         description: No active daily incentive
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
 *                   example: No active daily incentive available
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
 *                   example: Failed to fetch incentive
 */


// TOKEN REQUIRED
router.get("/daily", riderAuthMiddleWare, getDailyIncentive);

module.exports = router;
