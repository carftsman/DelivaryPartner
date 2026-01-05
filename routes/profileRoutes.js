const express=require('express');
const router=express.Router();
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");
const {getProfile}=require('../controllers/profileController')
const {getBankDetails}=require('../controllers/bankDetailsController')
const {getKitAddress}=require('../controllers/kitAddressController')
const uploadSelfie = require("../middleware/uploadSelfie");
const { upload } = require("../utils/azureUpload");

const { updateProfile,getAllDocuments,getWalletDetails,updateDocuments,getRiderOrderHistory,getSlotHistory } = require("../controllers/profileController");

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update rider profile (single field or selfie)
 *     description: >
 *       Updates rider profile details.  
 *       Supports updating **any single text field**, multiple fields, or **selfie upload**.
 *       Selfie is uploaded to Azure Blob Storage and the URL is saved.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               streetAddress:
 *                 type: string
 *                 example: "12-3-456"
 *               area:
 *                 type: string
 *                 example: "Kukatpally"
 *               city:
 *                 type: string
 *                 example: "Hyderabad"
 *               state:
 *                 type: string
 *                 example: "Telangana"
 *               pincode:
 *                 type: string
 *                 example: "500072"
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Upload selfie image (jpg/png). Stored in Azure Blob Storage.
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   example:
 *                     city: Hyderabad
 *                     selfie: https://azurebloburl/selfies/1704692123.jpg
 *       400:
 *         description: No data provided for update
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
 *                   example: No data provided for update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Rider not found
 *       500:
 *         description: Server error
 */

router.put("/update", riderAuthMiddleWare,  upload.single("selfie"),
 updateProfile);


/**
 * @swagger
 * /api/profile/rider/profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get rider profile
 *     description: >
 *       Fetch the logged-in rider’s profile with clean and required fields only.
 *       This API excludes wallet details, bank details, KYC documents,
 *       permissions, boolean flags, and other internal system fields.
 *       Empty or undefined fields are automatically removed from the response.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *                   example: Profile fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 694e527648bc25e14034aab0
 *                     phone:
 *                       type: object
 *                       properties:
 *                         countryCode:
 *                           type: string
 *                           example: "+91"
 *                         number:
 *                           type: string
 *                           example: "9988123456"
 *                     personalInfo:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: GuruNath
 *                         dob:
 *                           type: string
 *                           format: date
 *                           example: 1995-05-10
 *                     location:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: Visakhapatnam
 *                         area:
 *                           type: string
 *                           example: Dwaraka Nagar
 *                     vehicleInfo:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: bike
 *                     selfie:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: https://deliverypartner.blob.core.windows.net/delivery/selfies/selfie.jpg
 *                         uploadedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-12-26T10:14:20.586Z
 *                     onboardingStage:
 *                       type: string
 *                       example: KYC_APPROVAL_PENDING
 *                     lastOtpVerifiedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-01T00:00:00.000Z
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
 *                   example: Server error
 */

router.get("/rider/profile", riderAuthMiddleWare, getProfile);
// Get bank details
/**
 * @swagger
 * /api/profile/bank-details:
 *   get:
 *     tags: [Profile]
 *     summary: Get rider bank details
 *     description: Fetches saved bank account details for the authenticated rider.
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Bank details fetched successfully
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
 *                     bankName:
 *                       type: string
 *                       example: HDFC Bank
 *                     accountHolderName:
 *                       type: string
 *                       example: Jagadeesh Kumar
 *                     accountNumber:
 *                       type: string
 *                       example: "123456789012"
 *                     ifscCode:
 *                       type: string
 *                       example: HDFC0001234
 *                     addedBankAccount:
 *                       type: boolean
 *                       example: true
 *
 *       401:
 *         description: Unauthorized or invalid token
 *
 *       500:
 *         description: Server error
 */

router.get("/bank-details", riderAuthMiddleWare, getBankDetails);
// Get kit address
 
/**
 * @swagger
 * /api/profile/kit-address:
 *   get:
 *     tags: [Profile]
 *     summary: Get kit delivery address
 *     description: Fetches the kit delivery address of the authenticated rider.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Kit delivery address fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kit delivery address fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Suji"
 *                     completeAddress:
 *                       type: string
 *                       example: "Flat 203, Main Road, Near Metro Station"
 *                     pincode:
 *                       type: string
 *                       example: "560001"
 *
 *       401:
 *         description: Unauthorized – invalid or missing token
 *
 *       404:
 *         description: Kit delivery address not found
 *
 *       500:
 *         description: Server error while fetching kit address
 */
 
 
router.get(
  "/kit-address",
  riderAuthMiddleWare,
  getKitAddress
);
/**
 * @swagger
 * /api/profile/documents:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get rider KYC documents
 *     description: >
 *       Fetch all KYC-related documents of the logged-in rider in a single API.
 *       This includes Aadhaar, PAN, and Driving License details if available.
 *       No bank details, permissions, or non-KYC profile data are returned.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents fetched successfully
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
 *                   example: Documents fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     aadhar:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         isVerified:
 *                           type: boolean
 *                           example: true
 *                         status:
 *                           type: string
 *                           example: approved
 *                     pan:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         number:
 *                           type: string
 *                           example: GUTHT6666H
 *                         image:
 *                           type: string
 *                           example: https://deliverypartner.blob.core.windows.net/delivery/pan/pan.jpg
 *                         status:
 *                           type: string
 *                           example: pending
 *                     drivingLicense:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         number:
 *                           type: string
 *                           example: HJ56567896786786
 *                         frontImage:
 *                           type: string
 *                           example: https://deliverypartner.blob.core.windows.net/delivery/dl-front/front.jpg
 *                         backImage:
 *                           type: string
 *                           example: https://deliverypartner.blob.core.windows.net/delivery/dl-back/back.jpg
 *                         status:
 *                           type: string
 *                           example: pending
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
 *                   example: Server error
 */

router.get("/documents", riderAuthMiddleWare, getAllDocuments);

/**
 * @swagger
 * /api/profile/wallet:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get rider wallet details
 *     description: >
 *       Fetch wallet details of the logged-in rider.
 *       This API returns only wallet-related information such as
 *       balance, total earned amount, and total withdrawn amount.
 *       No profile data, KYC documents, bank details, or permissions are included.
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Wallet details fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 1850
 *                     totalEarned:
 *                       type: number
 *                       example: 7200
 *                     totalWithdrawn:
 *                       type: number
 *                       example: 5350
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
 *                   example: Server error
 */

router.get("/wallet", riderAuthMiddleWare, getWalletDetails);
/**
 * @swagger
 * /api/profile/documents/update:
 *   put:
 *     summary: Update rider KYC documents
 *     description: Update or re-upload rider documents like Aadhaar, PAN, License, etc. Used when documents expire or change.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kyc:
 *                 type: object
 *                 example:
 *                   aadhaar:
 *                     number: "123456789012"
 *                     status: "verified"
 *                   pan:
 *                     number: "ABCDE1234F"
 *                     status: "pending"
 *                   drivingLicense:
 *                     number: "DL-0420110149646"
 *                     expiryDate: "2026-12-31"
 *                     status: "uploaded"
 *     responses:
 *       200:
 *         description: Documents updated successfully
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
 *                   example: Documents updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Rider not found
 *       500:
 *         description: Server error
 */

router.put(
  "/documents/update",
  riderAuthMiddleWare,        // your auth middleware
  updateDocuments
);
/**
 * @swagger
 * /api/profile/orders/history:
 *   get:
 *     summary: Get Rider Order History
 *     description: >
 *       Fetch delivered orders for the logged-in rider.
 *       Supports daily, weekly, monthly, or all-time filters.
 *       Returns totals (orders, earnings, distance, rating) and
 *       detailed order data including items, pricing, and delivery address.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *           enum: [all, daily, weekly, monthly]
 *           default: all
 *         description: Filter orders by time range
 *     responses:
 *       200:
 *         description: Rider order history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 filter:
 *                   type: string
 *                   example: monthly
 *                 totalOrders:
 *                   type: integer
 *                   example: 5
 *                 totalEarnings:
 *                   type: number
 *                   example: 916
 *                 totalDistance:
 *                   type: number
 *                   example: 42.7
 *                 avgRating:
 *                   type: number
 *                   nullable: true
 *                   example: 4.6
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                         example: ORD-GURU-001
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             itemName:
 *                               type: string
 *                               example: Tomato
 *                             quantity:
 *                               type: integer
 *                               example: 2
 *                             price:
 *                               type: number
 *                               example: 40
 *                             total:
 *                               type: number
 *                               example: 80
 *                       pricing:
 *                         type: object
 *                         properties:
 *                           itemTotal:
 *                             type: number
 *                             example: 60
 *                           deliveryFee:
 *                             type: number
 *                             example: 25
 *                           tax:
 *                             type: number
 *                             example: 5
 *                           platformCommission:
 *                             type: number
 *                             example: 5
 *                           totalAmount:
 *                             type: number
 *                             example: 95
 *                       customerTip:
 *                         type: number
 *                         example: 10
 *                       distanceTravelled:
 *                         type: number
 *                         example: 5.2
 *                       rating:
 *                         type: number
 *                         nullable: true
 *                         example: 5
 *                       deliveredAddress:
 *                         type: string
 *                         example: Kondapur
 *       400:
 *         description: Rider ID missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
  "/orders/history",
  riderAuthMiddleWare,
  getRiderOrderHistory
);
/**
 * @swagger
 * /api/profile/slots/history:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get rider slot history
 *     description: >
 *       Fetches slot history for the authenticated rider with earnings and order statistics.
 *       Supports daily, weekly, and monthly filters.
 *       Orders are calculated day-wise for each slot.
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         required: false
 *         description: Filter type for slot history
 *
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2026-01-05"
 *         required: false
 *         description: Specific date for daily filter (YYYY-MM-DD)
 *
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 1
 *         required: false
 *         description: Month number for monthly filter (1-12)
 *
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *         required: false
 *         description: Year for monthly filter
 *
 *     responses:
 *       200:
 *         description: Slot history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 filter:
 *                   type: string
 *                   example: daily
 *                 totalSlots:
 *                   type: integer
 *                   example: 1
 *                 totalEarnings:
 *                   type: number
 *                   example: 60
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slotBookingId:
 *                         type: string
 *                         example: "695b541094c6d3aa76cada71"
 *                       date:
 *                         type: string
 *                         example: "2026-01-05"
 *                       startTime:
 *                         type: string
 *                         example: "18:00"
 *                       endTime:
 *                         type: string
 *                         example: "20:00"
 *                       slotStatus:
 *                         type: string
 *                         enum: [ACTIVE, COMPLETED, CANCELED]
 *                         example: COMPLETED
 *                       totalOrders:
 *                         type: integer
 *                         example: 1
 *                       completedOrders:
 *                         type: integer
 *                         example: 1
 *                       canceledOrders:
 *                         type: integer
 *                         example: 0
 *                       slotEarnings:
 *                         type: number
 *                         example: 60
 *
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *
 *       500:
 *         description: Internal server error
 */

router.get(
  "/slots/history",
  riderAuthMiddleWare,
  getSlotHistory
);

module.exports=router;
