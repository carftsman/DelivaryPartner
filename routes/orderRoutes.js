const express = require("express");
const router = express.Router();

const {
  createOrder,
  confirmOrder,
  // assignOrderToRider,
   acceptOrder,
   rejectOrder,
   getOrderDetails,
  // pickupOrder,
} = require("../controllers/orderController");

// ================================
// CREATE ORDER
// ================================

/**
 * @swagger
 * /api/orders/orderCreate:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     description: >
 *       Creates a new order with vendor details, items, pickup and delivery addresses.
 *       Item total is calculated on the server side.
 *       Order status will be CREATED after successful creation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorShopName
 *               - items
 *               - pickupAddress
 *               - deliveryAddress
 *               - payment
 *             properties:
 *               vendorShopName:
 *                 type: string
 *                 example: Daily Needs Store
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemName
 *                     - quantity
 *                     - price
 *                   properties:
 *                     itemName:
 *                       type: string
 *                       example: Basmati Rice
 *                     quantity:
 *                       type: number
 *                       example: 5
 *                     price:
 *                       type: number
 *                       example: 60
 *               pickupAddress:
 *                 type: object
 *                 required:
 *                   - name
 *                   - lat
 *                   - lng
 *                   - addressLine
 *                   - contactNumber
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Daily Needs Store
 *                   lat:
 *                     type: number
 *                     example: 17.42
 *                   lng:
 *                     type: number
 *                     example: 78.39
 *                   addressLine:
 *                     type: string
 *                     example: Miyapur
 *                   contactNumber:
 *                     type: string
 *                     example: "9012345679"
 *               deliveryAddress:
 *                 type: object
 *                 required:
 *                   - name
 *                   - lat
 *                   - lng
 *                   - addressLine
 *                   - contactNumber
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Anil Sharma
 *                   lat:
 *                     type: number
 *                     example: 17.46
 *                   lng:
 *                     type: number
 *                     example: 78.41
 *                   addressLine:
 *                     type: string
 *                     example: Kukatpally
 *                   contactNumber:
 *                     type: string
 *                     example: "9898989896"
 *               payment:
 *                 type: object
 *                 required:
 *                   - mode
 *                 properties:
 *                   mode:
 *                     type: string
 *                     enum: [COD, ONLINE]
 *                     example: COD
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orderId:
 *                   type: string
 *                   example: ORD-F95B0DB0
 *                 mongoId:
 *                   type: string
 *                   example: 6971bf46b086deb130aac60b
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.post("/orderCreate", createOrder);

// ================================
// CONFIRM ORDER
// ================================



/**
 * @swagger
 * /api/orders/{orderId}/confirm:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Confirm an order
 *     description: >
 *       Confirms an order that is in CREATED state.
 *       The system finds up to 5 eligible riders, updates the order status to CONFIRMED,
 *       allocates the riders, and sends WebSocket notifications to them.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Unique order ID to confirm
 *         schema:
 *           type: string
 *           example: ORD-F95B0DB0
 *     responses:
 *       200:
 *         description: Order confirmed successfully and riders notified
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
 *                   example: Order confirmed and sent to riders
 *                 notifiedRiders:
 *                   type: number
 *                   example: 5
 *       400:
 *         description: Invalid order state or no riders available
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
 *                   example: Order already processed
 *       404:
 *         description: Order not found
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
 *                   example: Order not found
 *       500:
 *         description: Internal server error
 */



router.patch("/:orderId/confirm", confirmOrder);

// ================================
// ASSIGN ORDER TO RIDER
// ================================
// router.patch("/:orderId/assign", assignOrderToRider);

// ================================
// RIDER ACCEPT ORDER
// ================================


/**
 * @swagger
 * /api/orders/{orderId}/accept:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Rider accepts an order
 *     description: >
 *       Allows a rider to accept a CONFIRMED order within the allocation window.
 *       The first rider to accept gets assigned.
 *       Once accepted, all other candidate riders are automatically rejected.
 *       This operation is atomic to avoid race conditions.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Unique order ID to accept
 *         schema:
 *           type: string
 *           example: ORD-F95B0DB0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - riderId
 *             properties:
 *               riderId:
 *                 type: string
 *                 description: Rider ID who is accepting the order
 *                 example: 696b6787f212b183b5dffe5f
 *     responses:
 *       200:
 *         description: Order accepted and assigned successfully
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
 *                   example: Order assigned successfully
 *                 orderId:
 *                   type: string
 *                   example: ORD-F95B0DB0
 *       409:
 *         description: Order already assigned, expired, or rider not eligible
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
 *                   example: Order already assigned or expired
 *       500:
 *         description: Internal server error
 */



router.patch("/:orderId/accept", acceptOrder);

// ================================
// RIDER REJECT ORDER
// ================================


/**
 * @swagger
 * /api/orders/{orderId}/reject:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Rider rejects an order
 *     description: >
 *       Allows a rider to reject a CONFIRMED order during the allocation window.
 *       The rider must be one of the allocated candidate riders and must be in PENDING state.
 *       The rejection is handled atomically to prevent race conditions.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Unique order ID to reject
 *         schema:
 *           type: string
 *           example: ORD-F95B0DB0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - riderId
 *             properties:
 *               riderId:
 *                 type: string
 *                 description: Rider ID who is rejecting the order
 *                 example: 696b6787f212b183b5dffe5c
 *               reason:
 *                 type: string
 *                 description: Optional reason for rejection
 *                 example: Vehicle issue
 *     responses:
 *       200:
 *         description: Order rejected successfully
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
 *                   example: Order rejected successfully
 *                 pendingRiders:
 *                   type: number
 *                   description: Number of riders still in PENDING state
 *                   example: 3
 *       409:
 *         description: Order already assigned or cannot be rejected
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
 *                   example: Order already assigned or cannot be rejected
 *       500:
 *         description: Internal server error
 */

 router.patch("/:orderId/reject", rejectOrder);

// ================================
// GET ORDER DETAILS
// ================================

/**
 * @swagger
 * /api/orders/{orderId}/details:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order details by orderId
 *     description: >
 *       Fetches limited order details using the orderId.
 *       Only selected fields like items, addresses, and pricing are returned.
 *       Rider, allocation, payment, and settlement details are intentionally excluded.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Unique order ID
 *         schema:
 *           type: string
 *           example: ORD-F95B0DB0
 *     responses:
 *       200:
 *         description: Order details fetched successfully
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
 *                   example: Order details fetched successfully
 *                 filteredOrder:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6971bf46b086deb130aac60b
 *                     orderId:
 *                       type: string
 *                       example: ORD-F95B0DB0
 *                     vendorShopName:
 *                       type: string
 *                       example: Daily Needs Store
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemName:
 *                             type: string
 *                             example: Basmati Rice
 *                           quantity:
 *                             type: number
 *                             example: 5
 *                           price:
 *                             type: number
 *                             example: 60
 *                           total:
 *                             type: number
 *                             example: 300
 *                     pickupAddress:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Daily Needs Store
 *                         lat:
 *                           type: number
 *                           example: 17.42
 *                         lng:
 *                           type: number
 *                           example: 78.39
 *                         addressLine:
 *                           type: string
 *                           example: Miyapur
 *                         contactNumber:
 *                           type: string
 *                           example: "9012345679"
 *                     deliveryAddress:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Anil Sharma
 *                         lat:
 *                           type: number
 *                           example: 17.46
 *                         lng:
 *                           type: number
 *                           example: 78.41
 *                         addressLine:
 *                           type: string
 *                           example: Kukatpally
 *                         contactNumber:
 *                           type: string
 *                           example: "9898989896"
 *                     pricing:
 *                       type: object
 *                       properties:
 *                         itemTotal:
 *                           type: number
 *                           example: 580
 *                         deliveryFee:
 *                           type: number
 *                           example: 0
 *                         tax:
 *                           type: number
 *                           example: 0
 *                         platformCommission:
 *                           type: number
 *                           example: 0
 *                         totalAmount:
 *                           type: number
 *                           example: 580
 *       404:
 *         description: Order not found
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
 *                   example: Order not found
 *       500:
 *         description: Internal server error
 */
router.get("/:orderId/details", getOrderDetails);


// ================================
// PICKUP ORDER
// ================================
// router.patch("/:orderId/pickup", pickupOrder);

module.exports = router;
