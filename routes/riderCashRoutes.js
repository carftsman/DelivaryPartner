const express = require("express");
const router = express.Router();

const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");
const {
  withdrawFromWallet,
  handoverCodCash
} = require("../controllers/riderCashController");
/**
 * @swagger
 * /api/rider/cod/handover:
 *   post:
 *     tags:
 *       - Rider Cash
 *     summary: Handover COD cash by rider
 *     description: >
 *       Allows a rider to hand over collected COD cash.
 *       The system deposits the amount using FIFO logic (oldest COD orders first)
 *       and updates order deposit status and rider cash balance.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *                 description: Amount of COD cash being handed over
 *     responses:
 *       200:
 *         description: COD cash handed over successfully
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
 *                   example: COD cash handed over successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     handedOverAmount:
 *                       type: number
 *                       example: 500
 *                     remainingCashBalance:
 *                       type: number
 *                       example: 700
 *                     currency:
 *                       type: string
 *                       example: INR
 *       400:
 *         description: Invalid handover amount
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
 *                   example: Invalid handover amount
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
 *                   example: Something went wrong
 */

// ✅ Attach middleware here
router.post(
  "/rider/cod/handover",
  riderAuthMiddleWare,
  handoverCodCash
);

router.post(
  "/rider/wallet/withdraw",
  riderAuthMiddleWare,  // add middleware here too if auth required
  withdrawFromWallet
);

module.exports = router;
