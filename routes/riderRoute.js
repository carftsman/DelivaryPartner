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
  uploadPan,
  uploadDL,
  getProfile,
  savePermissions,
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
 *     tags: [Rider]
 *     summary: Update rider location (city & area)
 *     description: Saves selected city and area for the rider and moves onboarding to SELECT_VEHICLE stage.
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *               - area
 *             properties:
 *               city:
 *                 type: string
 *                 example: "Hyderabad"
 *               area:
 *                 type: string
 *                 example: "Madhapur"
 *
 *     responses:
 *       200:
 *         description: Location updated successfully
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
 *                   example: Location updated
 *                 location:
 *                   type: object
 *                   properties:
 *                     city:
 *                       type: string
 *                       example: Hyderabad
 *                     area:
 *                       type: string
 *                       example: Madhapur
 *                 nextStage:
 *                   type: string
 *                   example: SELECT_VEHICLE
 *
 *       400:
 *         description: Missing city or area
 *
 *       404:
 *         description: Invalid city or area
 *
 *       500:
 *         description: Server error
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
 *     description: Upload selfie image file. Field name must be "selfie".
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - selfie
 *             properties:
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Rider selfie image (jpg/png)
 *
 *     responses:
 *       200:
 *         description: Selfie uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie uploaded successfully"
 *                 selfieUrl:
 *                   type: string
 *                   example: "/uploads/selfies/1700000000000-myphoto.jpg"
 *                 file:
 *                   type: object
 *                   properties:
 *                     originalname:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     mimetype:
 *                       type: string
 *
 *       400:
 *         description: Bad request (file missing)
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 *       500:
 *         description: Server error
 */

riderRouter.post(
  "/rider/selfie",
  riderAuthMiddleWare,
  upload.single("selfie"),
  uploadSelfieController
);
// ============================================================
   // KYC DOCUMENTS
// ============================================================ 

/**
 * @swagger
 * /api/rider/pan:
 *   post:
 *     tags: [KYC]
 *     summary: Upload PAN card + PAN number
 *     description: Upload PAN card image and PAN number for rider KYC. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - pan
 *               - panNumber
 *             properties:
 *               pan:
 *                 type: string
 *                 format: binary
 *                 description: PAN card image file
 *
 *               panNumber:
 *                 type: string
 *                 example: "ABCDE1234F"
 *                 description: Rider's PAN card number
 *
 *     responses:
 *       200:
 *         description: PAN uploaded successfully
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
 *                   example: PAN uploaded successfully
 *                 imageUrl:
 *                   type: string
 *                   example: "https://your-azure-url.com/pan/12345.png"
 *                 panNumber:
 *                   type: string
 *                   example: "ABCDE1234F"
 *
 *       400:
 *         description: Missing file or invalid PAN number
 *
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *
 *       404:
 *         description: Rider not found
 *
 *       500:
 *         description: Server error while uploading PAN
 */

riderRouter.post(
  "/rider/pan",
  riderAuthMiddleWare,
  upload.single("pan"),
  uploadPan
);

/**
 * @swagger
 * /api/rider/dl:
 *   post:
 *     tags: [KYC]
 *     summary: Upload Driving License front, back images + DL number
 *     description: Uploads DL images and DL number. Updates rider onboarding & KYC status.
 *     
 *     security:
 *       - bearerAuth: []
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
 *               - dlNumber
 *             properties:
 *               front:
 *                 type: string
 *                 format: binary
 *                 description: Driving License front image
 *               back:
 *                 type: string
 *                 format: binary
 *                 description: Driving License back image
 *               dlNumber:
 *                 type: string
 *                 example: "DL-0420110149646"
 *                 description: Driving License number
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
 *                       example: "uploads/dl/front.jpg"
 *                     backImage:
 *                       type: string
 *                       example: "uploads/dl/back.jpg"
 *                     dlNumber:
 *                       type: string
 *                       example: "DL-0420110149646"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *
 *       400:
 *         description: Missing fields or invalid DL number
 *       404:
 *         description: Rider not found
 *       500:
 *         description: Server error
 */

riderRouter.post(
  "/rider/dl",
  riderAuthMiddleWare,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  uploadDL
);
/**
 * @swagger
 * /api/rider/permissions:
 *   post:
 *     tags: [Rider]
 *     summary: Save app permissions (camera, foreground, background)
 *     description: Moved to next stage after permissions are granted. Requires Bearer token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               camera:
 *                 type: boolean
 *                 example: true
 *               foregroundLocation:
 *                 type: boolean
 *                 example: true
 *               backgroundLocation:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Permissions saved successfully
 *       400:
 *         description: Invalid or missing boolean values
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

riderRouter.post(
  "/rider/permissions",
  riderAuthMiddleWare,
  savePermissions
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
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       404:
 *         description: Rider not found
 */
riderRouter.get("/rider/profile", riderAuthMiddleWare, getProfile);


module.exports = riderRouter;
