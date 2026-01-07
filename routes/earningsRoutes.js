const express = require("express");
const earningsRouter = express.Router()

const {
    getEarningsOrders,
  getEarningOrderDetail,
  getMonthEarnings,
  getWallet,
  getWeekEarnings,
  getDayEarnings,
  getEarningsSummary
} = require("../controllers/earningsController");

const {riderAuthMiddleWare} = require("../middleware/riderAuthMiddleware.js");  // rideruth

// console.log("riderAuth type:", typeof riderAuthMiddleWare);
// console.log("getEarningsOrders type:", typeof getEarningsOrders);


/**
 * @swagger
 * /api/earnings/orders:
 *   get:
 *     tags: [Earnings]
 *     summary: Get earnings orders list (today / week / month)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *         required: false
 *         description: Filter orders by time range
 *     responses:
 *       200:
 *         description: Earnings orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: today
 *                 totalEarnings:
 *                   type: number
 *                   example: 840
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                         example: ORD123
 *                       amount:
 *                         type: number
 *                         example: 140
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch earnings orders
 */
earningsRouter.get("/orders", riderAuthMiddleWare, getEarningsOrders);

/**
 * @swagger
 * /api/earnings/orders/{orderId}:
 *   get:
 *     tags: [Earnings]
 *     summary: Get earnings details of a specific order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order earnings detail fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   example: ORD123
 *                 vendorShopName:
 *                   type: string
 *                   example: ABC Store
 *                 status:
 *                   type: string
 *                   example: COMPLETED
 *                 earnings:
 *                   type: object
 *                   properties:
 *                     deliveryAmount:
 *                       type: number
 *                       example: 120
 *                     peakHourBonus:
 *                       type: number
 *                       example: 20
 *                     taxAndOtherFees:
 *                       type: number
 *                       example: 5
 *                     totalEarnings:
 *                       type: number
 *                       example: 135
 *                 deliveredAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to fetch order detail
 */
earningsRouter.get("/orders/:orderId", riderAuthMiddleWare, getEarningOrderDetail);

/**
 * @swagger
 * /api/earnings/month:
 *   get:
 *     tags: [Earnings]
 *     summary: Get current month total earnings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Month earnings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 monthEarnings:
 *                   type: number
 *                   example: 1360
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch month earnings
 */

earningsRouter.get("/month",riderAuthMiddleWare,getMonthEarnings);

/**
 * @swagger
 * /api/earnings/wallet:
 *   get:
 *     tags: [Earnings]
 *     summary: Get rider wallet details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 1200
 *                 totalEarned:
 *                   type: number
 *                   example: 5000
 *                 totalWithdrawn:
 *                   type: number
 *                   example: 3800
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch wallet
 */

earningsRouter.get("/wallet",riderAuthMiddleWare,getWallet);

/**
 * @swagger
 * /api/earnings/week:
 *   get:
 *     tags: [Earnings]
 *     summary: Get current week earnings (calculated from delivered orders)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Week earnings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weekEarnings:
 *                   type: number
 *                   example: 5400
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch week earnings
 */
earningsRouter.get("/week",riderAuthMiddleWare,getWeekEarnings);





/**
 * @swagger
 * /api/earnings/summary:
 *   get:
 *     tags: [Earnings]
 *     summary: Get today and month earnings summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayEarnings:
 *                   type: number
 *                   example: 840
 *                 monthEarnings:
 *                   type: number
 *                   example: 1360
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch summary
 */
earningsRouter.get("/summary",riderAuthMiddleWare,getEarningsSummary);

/**
 * @swagger
 * /api/earnings/day:
 *   get:
 *     tags:
 *       - Earnings
 *     summary: Get rider day earnings summary
 *     description: >
 *       Fetch day-wise earnings summary for a rider.
 *       Data is fetched from EarningSummary collection.
 *       If date is not provided, today's earnings are returned.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: 2026-01-07
 *         required: false
 *         description: Date in YYYY-MM-DD format (optional, defaults to today)
 *     responses:
 *       200:
 *         description: Day earnings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   example: 2026-01-07
 *                 ordersCompleted:
 *                   type: integer
 *                   example: 6
 *                 onlineMinutes:
 *                   type: integer
 *                   example: 240
 *                 earnings:
 *                   type: object
 *                   properties:
 *                     baseEarnings:
 *                       type: number
 *                       example: 600
 *                     incentiveEarnings:
 *                       type: number
 *                       example: 200
 *                     tipEarnings:
 *                       type: number
 *                       example: 40
 *                     penaltyAmount:
 *                       type: number
 *                       example: 0
 *                 totalEarnings:
 *                   type: number
 *                   example: 840
 *                 incentives:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       incentiveType:
 *                         type: string
 *                         example: PEAK_HOUR
 *                       minOrders:
 *                         type: integer
 *                         example: 6
 *                       completedOrders:
 *                         type: integer
 *                         example: 6
 *                       rewardType:
 *                         type: string
 *                         example: FIXED_AMOUNT
 *                       rewardValue:
 *                         type: number
 *                         example: 200
 *                       earnedAmount:
 *                         type: number
 *                         example: 200
 *                       status:
 *                         type: string
 *                         example: COMPLETED
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */

earningsRouter.get("/day", riderAuthMiddleWare, getDayEarnings);

module.exports = earningsRouter;
