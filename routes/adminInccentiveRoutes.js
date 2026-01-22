const express = require("express");
const { adminIncentiveController,upsertIncentive } = require("../controllers/adminIncentiveController");
const adminRouterIncentives = express.Router();

adminRouterIncentives.get("/weekly",adminIncentiveController);
/**
 * @swagger
 * /api/admin/incentives/daily:
 *   post:
 *     summary: Create or Update Incentive (Once Per Day Restriction)
 *     tags:
 *       - Admin Incentives
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Admin can create or update incentive configuration.
 *       Updating more than once on the same day is restricted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - incentiveType
 *               - slotRules
 *               - slabs
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 example: Daily Target Bonus
 *               description:
 *                 type: string
 *                 example: Earn more with daily deliveries
 *               incentiveType:
 *                 type: string
 *                 enum: [DAILY_TARGET, WEEKLY_TARGET, PEAK_SLOT]
 *                 example: DAILY_TARGET
 *               slotRules:
 *                 type: object
 *                 required:
 *                   - minPeakSlots
 *                   - minNormalSlots
 *                 properties:
 *                   minPeakSlots:
 *                     type: number
 *                     example: 2
 *                   minNormalSlots:
 *                     type: number
 *                     example: 3
 *               slabs:
 *                 type: object
 *                 required:
 *                   - peak
 *                   - normal
 *                 properties:
 *                   peak:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - minOrders
 *                         - maxOrders
 *                         - rewardAmount
 *                       properties:
 *                         minOrders:
 *                           type: number
 *                           example: 5
 *                         maxOrders:
 *                           type: number
 *                           example: 8
 *                         rewardAmount:
 *                           type: number
 *                           example: 150
 *                   normal:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - minOrders
 *                         - maxOrders
 *                         - rewardAmount
 *                       properties:
 *                         minOrders:
 *                           type: number
 *                           example: 8
 *                         maxOrders:
 *                           type: number
 *                           example: 12
 *                         rewardAmount:
 *                           type: number
 *                           example: 120
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Incentive created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 action:
 *                   type: string
 *                   example: CREATED
 *                 message:
 *                   type: string
 *                   example: Incentive created successfully
 *       200:
 *         description: Incentive updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 action:
 *                   type: string
 *                   example: UPDATED
 *                 message:
 *                   type: string
 *                   example: Incentive updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Same day update restriction
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
 *                   example: Incentive already updated today. You can update again tomorrow.
 *       500:
 *         description: Server error
 */

adminRouterIncentives.post("/daily", upsertIncentive);

module.exports = adminRouterIncentives;
