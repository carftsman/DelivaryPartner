const express = require("express");
const router = express.Router();

const {riderAuthMiddleWare} = require("../middleware/riderAuthMiddleware");

const {
  goOnline,
  goOffline
} = require("../controllers/riderStatus.controller");

// ----------------------
// Rider Status APIs
// ----------------------
/**
 * @swagger
 * /api/rider/status/online:
 *   patch:
 *     tags: [Rider Status]
 *     summary: Set Rider Online
 *     description: Marks rider as ONLINE and updates login timestamp.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Rider successfully set to ONLINE
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
 *                   example: Rider is now ONLINE
 *                 riderStatus:
 *                   type: object
 *                   properties:
 *                     isOnline:
 *                       type: boolean
 *                       example: true
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-31T09:15:00.000Z"
 *                     lastLogoutAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     totalOnlineMinutesToday:
 *                       type: number
 *                       example: 0
 *
 *       400:
 *         description: Rider already online
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Rider not found
 *
 *       500:
 *         description: Server error
 */


router.patch("/online", riderAuthMiddleWare, goOnline);
/**
 * @swagger
 * /api/rider/status/offline:
 *   patch:
 *     tags: [Rider Status]
 *     summary: Set Rider Offline
 *     description: Marks rider as OFFLINE and updates logout timestamp and total online minutes.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Rider successfully set to OFFLINE
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
 *                   example: Rider is now OFFLINE
 *                 riderStatus:
 *                   type: object
 *                   properties:
 *                     isOnline:
 *                       type: boolean
 *                       example: false
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-31T09:15:00.000Z"
 *                     lastLogoutAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-31T10:15:00.000Z"
 *                     totalOnlineMinutesToday:
 *                       type: number
 *                       example: 60
 *
 *       400:
 *         description: Rider already offline
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Rider not found
 *
 *       500:
 *         description: Server error
 */

router.patch("/offline", riderAuthMiddleWare, goOffline);

module.exports = router;
