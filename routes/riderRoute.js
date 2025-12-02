const express = require("express");
const riderRouter = express.Router();

const {
  sendOtp,
  verifyOtp,
  checkStatus,
  updateLocation,
  
  updateVehicle,
  savePersonalInfo,
  uploadSelfieController,
  
  uploadAadhar,
  uploadPan,
  uploadDL,
  getProfile,
} = require("../controllers/riderRegisterController");
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");
const upload = require('../utils/multerSelfie')

/* ============================================================
   AUTH & OTP
============================================================ */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to rider mobile number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               countryCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 */
riderRouter.post("/auth/send-otp", sendOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and login/register rider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 *       401:
 *         description: Invalid or expired OTP
 */
riderRouter.post("/auth/verify-otp", verifyOtp);


/**
 * @swagger
 * /api/auth/status:
 *   get:
 *     tags: [Auth]
 *     summary: Check rider registration status
 *     parameters:
 *       - name: phone
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status returned
 *       404:
 *         description: Rider not found
 */
riderRouter.get("/auth/status", checkStatus);

/* ============================================================
   PERSONAL INFO
============================================================ */

/**
 * @swagger
 * /api/rider/personal-info:
 *   post:
 *     tags: [Rider Profile]
 *     summary: Save or update rider personal information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               dob:
 *                 type: string
 *               gender:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personal info updated
 */
riderRouter.post("/rider/personal-info",riderAuthMiddleWare, savePersonalInfo);

/* ===========================================================
   LOCATION
============================================================ */

/**
 * @swagger
 * /api/rider/location:
 *   post:
 *     tags: [Rider Profile]
 *     summary: Save rider location (city, area)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated
 */
riderRouter.post("/rider/location",riderAuthMiddleWare,updateLocation);

/* ============================================================
   VEHICLE
============================================================ */

/**
 * @swagger
 * /api/rider/vehicle:
 *   post:
 *     tags: [Rider Profile]
 *     summary: Save or update rider vehicle info
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bike, scooty, ev]
 *     responses:
 *       200:
 *         description: Vehicle updated
 */
riderRouter.post("/vehicle",riderAuthMiddleWare, updateVehicle);

/* ============================================================
   SELFIE
============================================================ */
riderRouter.post("/selfie", riderAuthMiddleWare, upload.single("selfie_file") , uploadSelfieController);

/**
 * @swagger
 * /api/rider/selfie:
 *   post:
 *     tags: [KYC]
 *     summary: Upload rider selfie
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Selfie uploaded
 *
/* ============================================================
   KYC DOCUMENTS
============================================================ */

/**
 * @swagger
 * /api/rider/kyc/aadhar:
 *   post:
 *     tags: [KYC]
 *     summary: Upload Aadhaar front/back images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               frontImage:
 *                 type: string
 *                 format: binary
 *               backImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Aadhaar uploaded
 */
riderRouter.post("/rider/kyc/aadhar", uploadAadhar);

/**
 * @swagger
 * /api/rider/kyc/pan:
 *   post:
 *     tags: [KYC]
 *     summary: Upload PAN card image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PAN uploaded
 */
riderRouter.post("/rider/kyc/pan", uploadPan);

/**
 * @swagger
 * /api/rider/kyc/dl:
 *   post:
 *     tags: [KYC]
 *     summary: Upload Driving License images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               frontImage:
 *                 type: string
 *                 format: binary
 *               backImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: DL uploaded
 */
riderRouter.post("/rider/kyc/dl", uploadDL);

/* ============================================================
   GET PROFILE
============================================================ */

/**
 * @swagger
 * /api/rider/profile:
 *   get:
 *     tags: [Rider Profile]
 *     summary: Get rider complete profile
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       404:
 *         description: Rider not found
 */
riderRouter.get("/rider/profile", getProfile);

module.exports = riderRouter;
