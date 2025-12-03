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
const {upload} = require("../utils/azureUpload");
// const uploadDriving=require('../utils/multerDL')

// ============================================================
//   AUTH & OTP
// ============================================================

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



/**
 * @swagger
 * /api/rider/personal-info:
 *   post:
 *     tags: [Rider]
 *     summary: Save rider personal information
 *     description: "Save rider personal details. Requires Bearer auth. fullName and primaryPhone are required. gender must be one of: male, female, other."
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - fullName
 *             - primaryPhone
 *           properties:
 *             fullName:
 *               type: string
 *               example: "Ramu Kumar"
 *             dob:
 *               type: string
 *               format: date
 *               example: "1995-05-21"
 *             gender:
 *               type: string
 *               enum: [male, female, other]
 *               example: male
 *             primaryPhone:
 *               type: string
 *               example: "9876543210"
 *             secondaryPhone:
 *               type: string
 *               example: "9123456780"
 *             email:
 *               type: string
 *               format: email
 *               example: "ramu@example.com"
 *     responses:
 *       200:
 *         description: Personal info saved successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Personal info saved successfully"
 *             data:
 *               type: object
 *               properties:
 *                 riderId:
 *                   type: string
 *                 personalInfo:
 *                   type: object
 *                 onboardingProgress:
 *                   type: object
 *                 onboardingStage:
 *                   type: string
 *       400:
 *         description: Validation error (missing required fields / invalid gender / flow checks)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Rider not found
 *       500:
 *         description: Server error
 */

riderRouter.post("/rider/personal-info", riderAuthMiddleWare, savePersonalInfo);

// ============================================================
//   LOCATION
// ============================================================

/**
 * @swagger
 * /api/rider/location:
 *   post:
 *     tags: [Rider Profile]
 *     summary: Save rider location (city, area)
 *     security:
 *       - bearerAuth: []
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
riderRouter.post("/rider/location", riderAuthMiddleWare, updateLocation);

// ============================================================
//   VEHICLE
// ============================================================

/**
 * @swagger
 * /api/rider/vehicle:
 *   post:
 *     tags: [Rider]
 *     summary: Update rider vehicle type
 *     description: "Save selected vehicle type. Allowed values: ev, bike, scooty. Requires Bearer auth."
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Vehicle type payload
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - type
 *           properties:
 *             type:
 *               type: string
 *               enum: [ev, bike, scooty]
 *               example: bike
 *     responses:
 *       200:
 *         description: Vehicle selected successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Vehicle selected successfully"
 *             data:
 *               type: object
 *               properties:
 *                 riderId:
 *                   type: string
 *                 vehicleInfo:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                 onboardingProgress:
 *                   type: object
 *                 onboardingStage:
 *                   type: string
 *       400:
 *         description: Bad request (missing or invalid vehicle type)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Rider not found
 *       500:
 *         description: Server error
 */

riderRouter.post("/rider/vehicle", riderAuthMiddleWare, updateVehicle);



/**
 * @swagger
 * /api/rider/selfie:
 *   post:
 *     tags: [Rider]
 *     summary: Upload rider selfie
 *     description: Upload selfie file. Field name must be selfie. Returns public file URL and metadata. Requires Bearer auth.
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: selfie
 *         type: file
 *         required: true
 *         description: Image file to upload (jpg/png). Field name selfie
 *     responses:
 *       200:
 *         description: Selfie uploaded successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Selfie uploaded successfully"
 *             selfieUrl:
 *               type: string
 *               example: "/uploads/selfies/1700000000000-myphoto.jpg"
 *             file:
 *               type: object
 *               properties:
 *                 originalname:
 *                   type: string
 *                 filename:
 *                   type: string
 *                 size:
 *                   type: integer
 *                 mimetype:
 *                   type: string
 *       400:
 *         description: Bad request (file missing / multer validation error)
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: Payload too large (file exceeded allowed size)
 *       500:
 *         description: Server error
 */
riderRouter.post(
  "/selfie",
  riderAuthMiddleWare,
  upload.single("selfie"),
  uploadSelfieController
);
// ============================================================
   // KYC DOCUMENTS
// ============================================================ 

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
 *     security:
 *       - bearerAuth: []
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
riderRouter.post(
  "/pan",
  riderAuthMiddleWare,
  upload.single("pan"),
  uploadPan
);

/**
 * @swagger
 * /api/dl/upload:
 *   post:
 *     tags: [KYC - Driving License]
 *     summary: Upload Driving License front & back images
 *     description: This API uploads DL front & back images and updates onboarding progress + KYC status.
 *     
 *     security:
 *       - bearerAuth: []   # JWT auth
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - front
 *               - back
 *             properties:
 *               front:
 *                 type: string
 *                 format: binary
 *                 description: Driving License front image
 *               back:
 *                 type: string
 *                 format: binary
 *                 description: Driving License back image
 *
 *     responses:
 *       200:
 *         description: Driving Licence uploaded successfully
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
 *                   example: Driving Licence uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     frontImage:
 *                       type: string
 *                       example: uploads/dl/front.jpg
 *                     backImage:
 *                       type: string
 *                       example: uploads/dl/back.jpg
 *                     status:
 *                       type: string
 *                       example: pending
 *
 *       400:
 *         description: Validation error - Missing images
 *       404:
 *         description: Rider not found
 *       500:
 *         description: Server error
 */

riderRouter.post(
  "/dl",
  riderAuthMiddleWare,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  uploadDL
);


// ============================================================
//   GET PROFILE
// ============================================================

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
