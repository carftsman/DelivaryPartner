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
 *     summary: Get rider cash-in-hand summary and COD order details
 *     description: |
 *       Returns the rider's cash-in-hand balance, pending COD amount,
 *       and COD order history. Used when rider collects cash via COD.
 *     tags:
 *       - Rider Wallet & Cash
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cash-in-hand details fetched successfully
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
 *                           example: 700
 *                         depositRequired:
 *                           type: boolean
 *                           example: false
 *                     lastDeposit:
 *                       type: number
 *                       example: 0
 *                     pendingOrdersSummary:
 *                       type: object
 *                       properties:
 *                         pendingOrdersCount:
 *                           type: number
 *                           example: 2
 *                         pendingAmount:
 *                           type: number
 *                           example: 700
 *                     cashOrderHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderId:
 *                             type: string
 *                             example: ORD12345
 *                           customerName:
 *                             type: string
 *                             example: Rahul Sharma
 *                           amount:
 *                             type: number
 *                             example: 350
 *                           status:
 *                             type: string
 *                             enum: [PENDING, DEPOSITED]
 *                             example: PENDING
 *                           collectedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-02-01T10:30:00Z
 *                           depositedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: null
 *                     rules:
 *                       type: object
 *                       properties:
 *                         depositWithinHours:
 *                           type: number
 *                           example: 24
 *                         warningMessage:
 *                           type: string
 *                           example: Cash must be deposited within 24 hours of collection. Failure to deposit may result in account suspension.
 *       400:
 *         description: Rider info missing
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
 *                   example: Rider info missing
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
 *         description: Internal server error
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
