
const express=require('express');
const router=express.Router();
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");
const {getProfile}=require('../controllers/profileController')
const {getBankDetails}=require('../controllers/bankDetailsController')
const {getKitAddress}=require('../controllers/kitAddressController')

const { updateProfile,getAllDocuments,getWalletDetails } = require("../controllers/profileController");

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update rider profile
 *     description: >
 *       Update allowed rider profile fields for the logged-in rider.
 *       Only basic profile information can be updated such as phone,
 *       personal information, location, vehicle details, and selfie.
 *       Sensitive fields like wallet, bank details, KYC documents,
 *       permissions, and system flags cannot be updated through this API.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: object
 *                 properties:
 *                   countryCode:
 *                     type: string
 *                     example: "+91"
 *                   number:
 *                     type: string
 *                     example: "9876543210"
 *               personalInfo:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: Guru Nath
 *                   dob:
 *                     type: string
 *                     format: date
 *                     example: 1995-05-10
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: Hyderabad
 *                   area:
 *                     type: string
 *                     example: Gachibowli
 *               vehicleInfo:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: bike
 *               selfie:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                     example: https://deliverypartner.blob.core.windows.net/delivery/selfies/selfie.jpg
 *                   uploadedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-12-26T10:14:20.586Z
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

router.put("/update", riderAuthMiddleWare, updateProfile);


/**
 * @swagger
 * /api/profile/rider/profile:
 *   get:
 *     summary: Get Rider Profile
 *     description: >
 *       Fetches the logged-in rider's profile details including personal info,
 *       contact details, location, selfie, and onboarding status.
 *       Internal or empty fields are removed before sending response.
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
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
 *                       example: 694fa3df48bc25e14034aaf1
 *
 *                     phone:
 *                       type: object
 *                       properties:
 *                         countryCode:
 *                           type: string
 *                           example: "+91"
 *                         number:
 *                           type: string
 *                           example: "9988123456"
 *
 *                     personalInfo:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: Hhhh
 *                         dob:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-12-29T00:00:00.000Z
 *                         gender:
 *                           type: string
 *                           example: male
 *                         primaryPhone:
 *                           type: string
 *                           example: "6666666666"
 *                         secondaryPhone:
 *                           type: string
 *                           example: "6639666636"
 *                         email:
 *                           type: string
 *                           example: h@gmail.com
 *
 *                     location:
 *                       type: object
 *                       properties:
 *                         streetAddress:
 *                           type: string
 *                           example: kphb
 *                         area:
 *                           type: string
 *                           example: KPHB Colony
 *                         city:
 *                           type: string
 *                           example: Hyderabad
 *                         state:
 *                           type: string
 *                           example: Telangana
 *                         pincode:
 *                           type: string
 *                           example: "500085"
 *
 *                     selfie:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: https://deliverypartner.blob.core.windows.net/delivery/selfies/1767010530491.jpg
 *                         uploadedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-12-29T12:15:31.741Z
 *
 *                     onboardingStage:
 *                       type: string
 *                       example: KYC_APPROVAL_PENDING
 *
 *                     lastOtpVerifiedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-01T00:00:00.000Z
 *
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
 *
 *       401:
 *         description: Unauthorized – Invalid or missing token
 *
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
 *     tags:
 *       - Profile
 *     summary: Get rider bank details
 *     description: Fetches saved bank account details along with IFSC and bank verification status for the authenticated rider.
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
 *                     bankDetails:
 *                       type: object
 *                       properties:
 *                         bankName:
 *                           type: string
 *                           example: HDFC Bank
 *                         accountType:
 *                           type: string
 *                           example: SAVINGS
 *                         branch:
 *                           type: string
 *                           example: Miyapur
 *                         accountHolderName:
 *                           type: string
 *                           example: Jagadeesh Kumar
 *                         accountNumber:
 *                           type: string
 *                           example: "123456789012"
 *                         ifscCode:
 *                           type: string
 *                           example: HDFC0001234
 *                     ifscVerificationStatus:
 *                       type: string
 *                       enum: [PENDING, VERIFIED, FAILED]
 *                       example: VERIFIED
 *                     bankVerificationStatus:
 *                       type: string
 *                       enum: [PENDING, VERIFIED, FAILED]
 *                       example: PENDING
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

module.exports=router;

