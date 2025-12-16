const express = require("express");
const router = express.Router();
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification
} = require("../controllers/notificationController");


/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications for logged-in rider
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications fetched
 */
router.get("/", riderAuthMiddleWare, getNotifications);


/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a notification for logged-in rider
 *     security:
 *       - bearerAuth: []
 */
router.post("/", riderAuthMiddleWare, createNotification);


/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 */
router.patch("/:notificationId/read", riderAuthMiddleWare, markAsRead);


/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:notificationId", riderAuthMiddleWare, deleteNotification);


module.exports = router;
