const express = require("express");
const slotRouter = express.Router();

const { getWeeklySlots, getDailySlots ,bookSlot , cancelSlot ,getCurrentSlot ,getDailySlotsWithStatus, getSlotHistory ,  getCurrentAndNextSlot} = require("../controllers/slotsController");
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

/**
 * @swagger
 * /api/slots/week:
 *   get:
 *     summary: Get weekly slots with date and day name
 *     description: Fetch slot list for a given week, city, and zone. Shows each day with its date, day name, and active slots.
 *     tags:
 *       - Slots
 *
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: City name
 *         example: Hyderabad
 *
 *       - in: query
 *         name: zone
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone name
 *         example: Gachibowli
 *
 *       - in: query
 *         name: weekNumber
 *         required: false
 *         schema:
 *           type: number
 *         description: Week number (1–52). Defaults to current week.
 *         example: 49
 *
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: number
 *         description: Year. Defaults to current year.
 *         example: 2025
 *
 *     responses:
 *       200:
 *         description: Weekly slots fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Weekly slots fetched"
 *               weekNumber: 49
 *               year: 2025
 *               count: 7
 *               data:
 *                 - date: "2025-12-01"
 *                   dayName: "Mon"
 *                   weekNumber: 49
 *                   year: 2025
 *                   city: "Hyderabad"
 *                   zone: "Gachibowli"
 *                   slots:
 *                     - slotId: "677fc1000000000000000011"
 *                       startTime: "06:00"
 *                       endTime: "08:00"
 *                       durationInHours: 2
 *                       maxRiders: 40
 *                       bookedRiders: 1
 *                       status: "ACTIVE"
 *
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             example: 
 *               success: false
 *               message: "City is required"
 *
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Server error"
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
 *     summary: Book multiple slots at once for a rider
 *     tags: [Slots]
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
 *               - date
 *               - slotIds
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2025-12-01"
 *                 description: Date of the slots (YYYY-MM-DD)
 *               slotIds:
 *                 type: array
 *                 description: List of slot IDs to book
 *                 items:
 *                   type: string
 *                 example: ["677fc1000000000000000011", "677fc1000000000000000012"]
 *
 *     responses:
 *       200:
 *         description: Slots booked successfully
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
 *                   example: "Slots booked successfully"
 *                 bookedCount:
 *                   type: number
 *                   example: 2
 *                 failedCount:
 *                   type: number
 *                   example: 1
 *                 booked:
 *                   type: array
 *                   description: List of successfully booked slots
 *                   items:
 *                     type: object
 *                 failed:
 *                   type: array
 *                   description: Slots that failed booking
 *                   items:
 *                     type: object
 *                     properties:
 *                       slotId:
 *                         type: string
 *                         example: "677fc1000000000000000015"
 *                       reason:
 *                         type: string
 *                         example: "Slot is full"
 *
 *       400:
 *         description: Invalid request / Some slots failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "No valid slots to book"
 *                 failed:
 *                   - slotId: "677fc1000000000000000017"
 *                     reason: "Already booked"
 *
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *
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

/**
 * @swagger
 * /api/slots/status:
 *   get:
 *     tags:
 *       - Slots
 *     summary: Get daily slots with booking status
 *     description: >
 *       Returns all slots for a specific date, city, and zone, including rider-specific booking status.  
 *       Filters:
 *       - **status=all** → all slots (available, booked, cancelled)  
 *       - **status=booked** → only slots booked by rider  
 *       - **status=cancelled** → only cancelled slots by rider  
 *       Requires Authorization header.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *           example: "2025-12-01"
 *
 *       - in: query
 *         name: city
 *         required: true
 *         description: City name
 *         schema:
 *           type: string
 *           example: "Hyderabad"
 *
 *       - in: query
 *         name: zone
 *         required: true
 *         description: Zone name
 *         schema:
 *           type: string
 *           example: "Gachibowli"
 *
 *       - in: query
 *         name: status
 *         required: false
 *         description: >
 *           Filter results:  
 *           - all (default)  
 *           - booked  
 *           - cancelled
 *         schema:
 *           type: string
 *           enum: [all,available, booked, cancelled]
 *           example: "all"
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
 *                 date:
 *                   type: string
 *                   example: "2025-12-01"
 *                 count:
 *                   type: number
 *                   example: 9
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slotId:
 *                         type: string
 *                         example: "677fc1000000000000000011"
 *                       startTime:
 *                         type: string
 *                         example: "06:00"
 *                       endTime:
 *                         type: string
 *                         example: "08:00"
 *                       isBooked:
 *                         type: boolean
 *                         example: true
 *                       isCancelled:
 *                         type: boolean
 *                         example: false
 *                       bookingId:
 *                         type: string
 *                         nullable: true
 *                         example: "6950aa2e12cdfe123ac99871"
 *                       bookingStatus:
 *                         type: string
 *                         example: "BOOKED"
 *
 *       400:
 *         description: Missing required params
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Date, city and zone are required"
 *
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Server error"
 */

slotRouter.get("/status", riderAuthMiddleWare, getDailySlotsWithStatus);


/**
 * @swagger
 * /api/slots/history:
 *   get:
 *     summary: Get weekly slot history for rider
 *     description: >
 *       Returns slot history for the selected week.  
 *       Includes weekly summary (completed, cancelled, no-shows, failed)  
 *       and day-wise slot details for all 7 days — even if the rider has no bookings on some days.
 *
 *     tags:
 *       - Slots
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: weekNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: ISO Week number (1–53)
 *
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Year (defaults to current year if empty)
 *
 *     responses:
 *       200:
 *         description: Weekly slot history fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Weekly slot history fetched"
 *               weekNumber: 51
 *               year: 2025
 *               summary:
 *                 totalSlots: 5
 *                 completed: 2
 *                 cancelled: 1
 *                 noShow: 1
 *                 failed: 1
 *               days:
 *                 - date: "2025-12-15"
 *                   totalSlots: 0
 *                   completed: 0
 *                   cancelled: 0
 *                   noShow: 0
 *                   failed: 0
 *                   slots: []
 *                 - date: "2025-12-16"
 *                   totalSlots: 1
 *                   completed: 0
 *                   cancelled: 1
 *                   noShow: 0
 *                   failed: 0
 *                   slots:
 *                     - _id: "65abd3fe283f91578bc12344"
 *                       date: "2025-12-16"
 *                       slotId: "677fc1ab0000000000000156"
 *                       startTime: "10:00"
 *                       endTime: "12:00"
 *                       status: "CANCELLED_BY_RIDER"
 *
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "weekNumber is required"
 *
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Server error"
 */


slotRouter.get("/history", riderAuthMiddleWare, getSlotHistory);

/**
 * @swagger
 * /api/slots/activeSlots:
 *   get:
 *     tags: [Slots]
 *     summary: Get current running slot and next upcoming booked slot
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Returns the rider's current active booked slot (if time is between slot start & end).  
 *       Also returns the next upcoming booked slot for today or the next day.
 *     responses:
 *       200:
 *         description: Current & next slot fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               currentSlot:
 *                 date: "2026-01-03"
 *                 startTime: "08:00"
 *                 endTime: "10:00"
 *                 status: "BOOKED"
 *               nextSlot:
 *                 date: "2026-01-03"
 *                 startTime: "12:00"
 *                 endTime: "14:00"
 *                 status: "BOOKED"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


slotRouter.get("/activeSlots", riderAuthMiddleWare, getCurrentAndNextSlot);


module.exports = slotRouter;