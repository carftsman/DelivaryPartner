const express = require("express");
const router = express.Router();
 
const {
 createOrder,
 assignOrderToRider,
 confirmOrder,
 rejectOrder,
 acceptOrder,
 getOrderDetails,
 pickupOrder
 
} = require("../controllers/orderController");
 
// Create Order

/**
 * @swagger
 * api/orders/orderCreate:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     description: >
 *       Creates a new order with items, pickup & delivery address,
 *       pricing calculation, and payment details.
 *       Item total and final amount are calculated server-side.
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               vendorShopName:
 *                 type: string
 *                 example: Pizza Hut
 *               userId:
 *                 type: string
 *                 example: 694fa3df48bc25e14034aaf1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - quantity
 *                     - price
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Margherita Pizza
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 250
 *               pickupAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: Pizza Hut, Miyapur
 *                   city:
 *                     type: string
 *                     example: Hyderabad
 *                   pincode:
 *                     type: string
 *                     example: "500049"
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: Flat 203, KPHB Colony
 *                   city:
 *                     type: string
 *                     example: Hyderabad
 *                   pincode:
 *                     type: string
 *                     example: "500085"
 *               pricing:
 *                 type: object
 *                 properties:
 *                   deliveryFee:
 *                     type: number
 *                     example: 40
 *                   tax:
 *                     type: number
 *                     example: 18
 *               payment:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                     example: CASH
 *                   status:
 *                     type: string
 *                     example: PENDING
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: ORD-1703502045123
 *                     orderStatus:
 *                       type: string
 *                       example: CREATED
 *                     pricing:
 *                       type: object
 *                       properties:
 *                         itemTotal:
 *                           type: number
 *                           example: 500
 *                         totalAmount:
 *                           type: number
 *                           example: 558
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/orderCreate", createOrder);

//confirm order

/**
 * @swagger
 * /api/orders/{orderId}/confirm:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Confirm an order
 *     description: >
 *       Confirms an order by changing its status from CREATED to CONFIRMED.
 *       Orders in any other status cannot be confirmed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Unique order ID generated during order creation
 *         schema:
 *           type: string
 *           example: ORD-1703502045123
 *     responses:
 *       200:
 *         description: Order confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order confirmed successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: ORD-1703502045123
 *                     orderStatus:
 *                       type: string
 *                       example: CONFIRMED
 *       400:
 *         description: Order cannot be confirmed from current status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order cannot be confirmed from status CANCELLED
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       500:
 *         description: Internal server error
 */

router.patch("/:orderId/confirm", confirmOrder);
 
 



/**
 * @swagger
 * /api/orders/{orderId}/assign:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Assign order to a rider
 *     description: >
 *       Assigns a confirmed order to a rider.
 *       Only orders with status CONFIRMED can be assigned.
 *       Once assigned, the order status is updated to ASSIGNED
 *       and a WebSocket event is sent to the rider.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Unique order ID
 *         schema:
 *           type: string
 *           example: ORD-1703502045123
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
 *                 description: Rider ID to whom the order is assigned
 *                 example: 694fa3df48bc25e14034aaf1
 *     responses:
 *       200:
 *         description: Order assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order assigned
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: ORD-1703502045123
 *                     orderStatus:
 *                       type: string
 *                       example: ASSIGNED
 *                     riderId:
 *                       type: string
 *                       example: 694fa3df48bc25e14034aaf1
 *       400:
 *         description: Invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid order state
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       500:
 *         description: Internal server error
 */


router.patch("/:orderId/assign", assignOrderToRider);




/**
 * @swagger
 * /api/orders/{orderId}/accept:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Rider accepts an assigned order
 *     description: >
 *       Allows a rider to accept an order that has been assigned to them.
 *       Only orders in ASSIGNED state can be accepted.
 *       The rider must be the same rider to whom the order was assigned.
 *       Once accepted, the assignment is locked.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Order ID to accept
 *         schema:
 *           type: string
 *           example: ORD-1703502045123
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
 *                 description: Rider ID assigned to the order
 *                 example: 694fa3df48bc25e14034aaf1
 *     responses:
 *       200:
 *         description: Order accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order accepted successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: ORD-1703502045123
 *                     orderStatus:
 *                       type: string
 *                       example: ASSIGNED
 *                     assignmentAcceptedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-02T10:45:30.000Z
 *       400:
 *         description: Invalid request or invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only ASSIGNED orders can be accepted
 *       403:
 *         description: Order not assigned to this rider
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This order is not assigned to you
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/accept", acceptOrder);







/**
 * @swagger
 * /api/orders/{orderId}/reject:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Rider rejects an assigned order
 *     description: >
 *       Allows a rider to reject an order that has been assigned to them.
 *       Only orders in ASSIGNED state can be rejected.
 *       On rejection, the order is unassigned and moved back to CONFIRMED state
 *       so it can be reassigned to another rider.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Order ID to reject
 *         schema:
 *           type: string
 *           example: ORD-1703502045123
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
 *                 description: Rider ID assigned to the order
 *                 example: 694fa3df48bc25e14034aaf1
 *               reason:
 *                 type: string
 *                 description: Optional reason for rejecting the order
 *                 example: Vehicle issue
 *     responses:
 *       200:
 *         description: Order rejected and unassigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order rejected and unassigned
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: ORD-1703502045123
 *                     orderStatus:
 *                       type: string
 *                       example: CONFIRMED
 *                     riderId:
 *                       nullable: true
 *                       example: null
 *                     rejectReason:
 *                       type: string
 *                       example: Vehicle issue
 *       400:
 *         description: Invalid request or invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only ASSIGNED orders can be rejected
 *       403:
 *         description: Order not assigned to this rider
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This order is not assigned to you
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/reject", rejectOrder);







/**
 * @swagger
 * /api/orders/{orderId}/details:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order details
 *     description: >
 *       Fetch detailed information of an order.
 *       Riders can view order details only if the order is in
 *       ASSIGNED, PICKED_UP, or DELIVERED state and the order
 *       is assigned to them.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *           example: ORD-1703502045123
 *       - in: query
 *         name: riderId
 *         required: true
 *         description: Rider ID requesting the order details (used for authorization)
 *         schema:
 *           type: string
 *           example: 694fa3df48bc25e14034aaf1
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order details fetched
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: ORD-1703502045123
 *                     orderStatus:
 *                       type: string
 *                       example: ASSIGNED
 *                     vendorShopName:
 *                       type: string
 *                       example: Pizza Hut
 *                     riderId:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 694fa3df48bc25e14034aaf1
 *                         name:
 *                           type: string
 *                           example: Rahul
 *                         phone:
 *                           type: string
 *                           example: "9876543210"
 *       403:
 *         description: You are not allowed to view this order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not allowed to view this order
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/:orderId/details", getOrderDetails);








/**
 * @swagger
 * /api/orders/{orderId}/pickup:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Rider picks up an assigned order
 *     description: >
 *       Allows the assigned rider to mark an order as picked up.
 *       Only orders in ASSIGNED state can be picked up.
 *       A WebSocket notification is optionally sent after pickup.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Order ID to pick up
 *         schema:
 *           type: string
 *           example: ORD-1703502045123
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
 *                 description: Rider ID assigned to the order
 *                 example: 694fa3df48bc25e14034aaf1
 *     responses:
 *       200:
 *         description: Order picked up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order picked up successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: ORD-1703502045123
 *                     orderStatus:
 *                       type: string
 *                       example: PICKED_UP
 *                     pickedUpAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-02T12:30:45.000Z
 *       400:
 *         description: Order is not ready for pickup or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order is not ready for pickup
 *       403:
 *         description: Order not assigned to this rider
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This order is not assigned to you
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/pickup", pickupOrder);

 

module.exports = router;