const express = require("express");
const router = express.Router();

// ✅ CHANGE IS HERE (Destructuring Import)
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

const {
  markDelivered,
  getDashboard,
  getOrders,
  getSlotHistory,
  getCashInHand,
  getWallet
} = require("../controllers/rider.controller");


// ==============================
// POST
// ==============================

router.post("/order/deliver", riderAuthMiddleWare, markDelivered);

// ==============================
// GET
// ==============================

router.get("/dashboard", riderAuthMiddleWare, getDashboard);
router.get("/orders", riderAuthMiddleWare, getOrders);
router.get("/slot-history", riderAuthMiddleWare, getSlotHistory);
/**
 * @swagger
 * /api/rider/cashbalance:
 *   get:
 *     tags:
 *       - Rider Cash
 *     summary: Get rider COD cash-in-hand summary
 *     description: >
 *       Fetches COD cash details for the logged-in rider including
 *       cash balance, pending COD orders, deposit status, and order-wise history.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cash summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cashSummary:
 *                       type: object
 *                       properties:
 *                         totalCashCollected:
 *                           type: number
 *                           example: 1800
 *                         currency:
 *                           type: string
 *                           example: INR
 *                         toDeposit:
 *                           type: number
 *                           example: 1200
 *                         depositRequired:
 *                           type: boolean
 *                           example: false
 *                     latestDeposit:
 *                       type: number
 *                       example: 500
 *                     pendingOrdersSummary:
 *                       type: object
 *                       properties:
 *                         pendingOrdersCount:
 *                           type: integer
 *                           example: 2
 *                         pendingAmount:
 *                           type: number
 *                           example: 1200
 *                     cashOrderHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderId:
 *                             type: string
 *                             example: ORD123456
 *                           customerName:
 *                             type: string
 *                             example: Rahul
 *                           totalAmount:
 *                             type: number
 *                             example: 600
 *                           depositedAmount:
 *                             type: number
 *                             example: 300
 *                           pendingAmount:
 *                             type: number
 *                             example: 300
 *                           status:
 *                             type: string
 *                             enum:
 *                               - PENDING
 *                               - PARTIAL_DEPOSITED
 *                               - DEPOSITED
 *                             example: PARTIAL_DEPOSITED
 *                           collectedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-02-05T10:30:00Z"
 *                           depositedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: "2026-02-05T15:00:00Z"
 *                     rules:
 *                       type: object
 *                       properties:
 *                         depositWithinHours:
 *                           type: integer
 *                           example: 24
 *                         warningMessage:
 *                           type: string
 *                           example: Cash must be deposited within 24 hours of collection. Failure to deposit may result in account suspension.
 *       401:
 *         description: Unauthorized rider
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
 *       404:
 *         description: Rider not found
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
 *                   example: Rider not found
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
 *                   example: Failed to fetch cash summary
 */


router.get("/cashbalance", riderAuthMiddleWare, getCashInHand);
router.get("/wallet", riderAuthMiddleWare, getWallet);

module.exports = router;
