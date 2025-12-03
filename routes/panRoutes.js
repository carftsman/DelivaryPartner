const express = require("express");
const router = express.Router();
const uploadPanMulter = require("../utils/multerPan");
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");
const { uploadPan } = require("../controllers/panController");

/**
 * @swagger
 * /pan/upload:
 *   post:
 *     tags: [PAN]
 *     summary: Upload PAN card image
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               panImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PAN uploaded successfully
 */
router.post(
  "/upload",
  riderAuthMiddleWare,
  uploadPanMulter.single("panImage"),
  uploadPan
);

module.exports = router;
