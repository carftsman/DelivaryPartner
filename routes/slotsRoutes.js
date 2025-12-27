const express = require("express");
const slotRouter = express.Router();

const { getWeeklySlots, getDailySlots ,bookSlot , cancelSlot ,getCurrentSlot ,getDailySlotsWithStatus} = require("../controllers/slotsController");
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

/**
 * @swagger
 * /api/slots/week:
 *   get:
 *     tags: [Slots]
 *     summary: Get weekly slots for a city & zone
 *     description: Fetch all active slots for a given week number and year. If weekNumber/year are not provided, current week is used.
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         example: Hyderabad
 *         description: City of the rider
 *
 *       - in: query
 *         name: zone
 *         required: true
 *         schema:
 *           type: string
 *         example: Gachibowli
 *         description: Operational zone inside the city
 *
 *       - in: query
 *         name: weekNumber
 *         required: false
 *         schema:
 *           type: number
 *         example: 49
 *
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: number
 *         example: 2025
 *
 *     responses:
 *       200:
 *         description: Weekly slots fetched successfully
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
 *                   example: Weekly slots fetched
 *                 weekNumber:
 *                   type: number
 *                   example: 49
 *                 year:
 *                   type: number
 *                   example: 2025
 *                 count:
 *                   type: number
 *                   example: 7
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         example: "2025-12-01"
 *                       startTime:
 *                         type: string
 *                         example: "18:00"
 *                       endTime:
 *                         type: string
 *                         example: "22:00"
 *                       isPeakSlot:
 *                         type: boolean
 *                         example: true
 *
 *       400:
 *         description: Missing required query params
 *
 *       500:
 *         description: Server error
 */


slotRouter.get("/week", getWeeklySlots);

/**
 * @swagger
 * /api/slots/day:
 *   get:
 *     tags: [Slots]
 *     summary: Get daily slots for a specific date
 *     description: Fetch all active slots available on a specific day.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2025-12-01
 *         description: Date for which slots are fetched (YYYY-MM-DD)
 *
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         example: Hyderabad
 *
 *       - in: query
 *         name: zone
 *         required: true
 *         schema:
 *           type: string
 *         example: Gachibowli
 *
 *     responses:
 *       200:
 *         description: Daily slots fetched successfully
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
 *                   example: Daily slots fetched
 *                 date:
 *                   type: string
 *                   example: "2025-12-01"
 *                 weekNumber:
 *                   type: number
 *                   example: 49
 *                 year:
 *                   type: number
 *                   example: 2025
 *                 count:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       startTime:
 *                         type: string
 *                         example: "08:00"
 *                       endTime:
 *                         type: string
 *                         example: "10:00"
 *                       isPeakSlot:
 *                         type: boolean
 *                         example: false
 *
 *       400:
 *         description: Missing required query params
 *
 *       500:
 *         description: Server error
 */


slotRouter.get("/day", getDailySlots);

/**
 * @swagger
 * /api/slots/book:
 *   post:
 *     summary: Book a rider slot
 *     description: Allows a fully registered rider to book a slot for a specific date.
 *     tags:
 *       - Slots
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - slotId
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2025-12-01"
 *                 description: Slot date (YYYY-MM-DD)
 *               slotId:
 *                 type: string
 *                 example: "677fc1000000000000000011"
 *                 description: ID of the slot inside slots[] array
 *     responses:
 *       200:
 *         description: Slot booked successfully
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
 *                   example: Slot booked successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing params or already booked or slot full/inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Rider not fully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Slot or day slot not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */


slotRouter.post("/book", riderAuthMiddleWare, bookSlot);

/**
 * @swagger
 * /api/slots/cancel/{bookingId}:
 *   delete:
 *     summary: Cancel a booked slot
 *     description: Rider cancels an already booked slot before the slot start time.
 *     tags:
 *       - Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Booking ID of the slot booking
 *     responses:
 *       200:
 *         description: Slot cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request (invalid bookingId or cannot cancel past slot)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Unauthorized attempt to cancel another rider's booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */


slotRouter.delete("/cancel/:bookingId", riderAuthMiddleWare, cancelSlot);

/**
 * @swagger
 * /api/slots/current:
 *   get:
 *     summary: Get the next upcoming slot for today
 *     tags:
 *       - Slots
 *     description: >
 *       Returns the next available upcoming ACTIVE slot for the current date based on the user's local time.
 *       If no upcoming slot is found, response will return `data: null`.
 *
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: City name (e.g., "Hyderabad")
 *
 *       - in: query
 *         name: zone
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone name (e.g., "Gachibowli")
 *
 *     responses:
 *       200:
 *         description: Successfully fetched next upcoming slot
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Upcoming slot for today"
 *               date: "2025-12-27"
 *               data:
 *                 daySlotId: "6950f9e348bc25e14034abf1"
 *                 slot:
 *                   slotId: "677fc1000000000000000017"
 *                   startTime: "18:00"
 *                   endTime: "20:00"
 *                   durationInHours: 2
 *                   bookedRiders: 12
 *                   maxRiders: 40
 *                   isPeakSlot: true
 *                   status: "ACTIVE"
 *
 *       400:
 *         description: Missing city or zone
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "city and zone are required"
 *
 *       200-NoSlots:
 *         description: No slots or no upcoming slots
 *         content:
 *           application/json:
 *             examples:
 *               noSlotsToday:
 *                 summary: No slots created for today
 *                 value:
 *                   success: true
 *                   message: "No slots created for today"
 *                   data: null
 *
 *               noUpcomingSlots:
 *                 summary: All slots for today already finished
 *                 value:
 *                   success: true
 *                   message: "No upcoming slots for today"
 *                   data: null
 *
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Server error"
 */


slotRouter.get("/current", riderAuthMiddleWare, getCurrentSlot);
slotRouter.get("/status", riderAuthMiddleWare, getDailySlotsWithStatus);


module.exports = slotRouter;