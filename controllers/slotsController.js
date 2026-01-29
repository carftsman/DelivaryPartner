const Slot = require("../models/SlotModel");
const {getWeekNumber} = require("../helpers/getWeekNumber");

const SlotBooking = require("../models/SlotBookingModel");
const Rider = require("../models/RiderModel");


// exports.getWeeklySlots = async (req, res) => {
//   try {
//     let { city, zone, weekNumber, year } = req.query;

//     if (!city) {
//       return res.status(400).json({ success: false, message: "City is required" });
//     }
//     if (!zone) {
//       return res.status(400).json({ success: false, message: "Zone is required" });
//     }

//     const today = new Date();

//     if (!weekNumber) {
//       weekNumber = getWeekNumber(today);
//     }

//     if (!year) {
//       year = today.getFullYear();
//     }

//     // Fetch all days of this week
//     const weekDocs = await Slot.find({
//       city,
//       zone,
//       weekNumber: Number(weekNumber),
//       year: Number(year)
//     }).sort({ date: 1 });

//     if (!weekDocs.length) {
//       return res.json({
//         success: true,
//         message: "No slots found for this week",
//         weekNumber,
//         year,
//         count: 0,
//         data: []
//       });
//     }

//     // Combine all active slots day-wise
//     const result = weekDocs.map(day => {
//       const activeSlots = day.slots
//         ?.filter(s => s.status === "ACTIVE")
//         ?.sort((a, b) => a.startTime.localeCompare(b.startTime));

//       return {
//         date: day.date,
//         weekNumber: day.weekNumber,
//         year: day.year,
//         city: day.city,
//         zone: day.zone,
//         slots: activeSlots
//       };
//     });

//     return res.json({
//       success: true,
//       message: "Weekly slots fetched",
//       weekNumber: Number(weekNumber),
//       year: Number(year),
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error("Get Weekly Slots Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.getWeeklySlots = async (req, res) => {
  try {
    let { city, zone, weekNumber, year } = req.query;

    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!zone) {
      return res.status(400).json({ success: false, message: "Zone is required" });
    }

    const today = new Date();

    if (!weekNumber) {
      weekNumber = getWeekNumber(today);
    }

    if (!year) {
      year = today.getFullYear();
    }

    // Fetch all days of this week
    const weekDocs = await Slot.find({
      city,
      zone,
      weekNumber: Number(weekNumber),
      year: Number(year)
    }).sort({ date: 1 });

    if (!weekDocs.length) {
      return res.json({
        success: true,
        message: "No slots found for this week",
        weekNumber,
        year,
        count: 0,
        data: []
      });
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Add date + dayName
const result = weekDocs.map(day => {
  // DEBUG
//   console.log("DAY DOC:", day);

  let currentDate = null;

  if (day.date instanceof Date) {
    currentDate = day.date;
  } 
  else if (typeof day.date === "string" && day.date.length >= 8) {
    // Handle string "2025-12-01"
    currentDate = new Date(`${day.date}T00:00:00`);
  } 
  else if (day._doc?.date) {
    // Sometimes mongoose stores it in _doc
    currentDate = new Date(`${day._doc.date}T00:00:00`);
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = currentDate ? dayNames[currentDate.getDay()] : "Invalid";

  const activeSlots = day.slots
    .filter(s => s.status === "ACTIVE")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    date: day.date || day._doc?.date || null,
    dayName,
    weekNumber: day.weekNumber,
    year: day.year,
    city: day.city,
    zone: day.zone,
    slots: activeSlots
  };
});



    return res.json({
      success: true,
      message: "Weekly slots fetched",
      weekNumber: Number(weekNumber),
      year: Number(year),
      count: result.length,
      data: result
    });

  } catch (err) {
    console.error("Get Weekly Slots Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// exports.getDailySlotsWithStatus = async (req, res) => {
//   try {
//     const riderId = req.rider?._id; // may be optional
//     const { date, city, zone, status = "all" } = req.query;

//     if (!date) {
//       return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)" });
//     }
//     if (!city) {
//       return res.status(400).json({ success: false, message: "City is required" });
//     }
//     if (!zone) {
//       return res.status(400).json({ success: false, message: "Zone is required" });
//     }

//     const dailyDoc = await Slot.findOne({ date, city, zone });

//     if (!dailyDoc) {
//       return res.json({
//         success: true,
//         message: "No slots found for this date",
//         date,
//         count: 0,
//         data: []
//       });
//     }

//     /* --------------------------------------------------
//        1) Fetch rider bookings for this day
//     -------------------------------------------------- */
//     let bookingMap = {};

//     if (riderId) {
//       const riderBookings = await SlotBooking.find({ riderId, date });

//       for (const b of riderBookings) {
//         bookingMap[b.slotId.toString()] = b;
//       }
//     }

//     /* --------------------------------------------------
//        2) Build enriched slot list
//     -------------------------------------------------- */
//     let resultSlots = dailyDoc.slots
//       .filter(s => s.status === "ACTIVE")
//       .sort((a, b) => a.startTime.localeCompare(b.startTime))
//       .map(slot => {
//         const booking = bookingMap[slot.slotId?.toString()];
//     // console.log("result" , resultSlots);
//         return {
//           ...slot._doc,
//           isBooked: !!booking,
//           bookingId: booking ? booking._id : null,
//           bookingStatus: booking ? booking.status : "NOT_BOOKED"
//         };
//       });

//     /* --------------------------------------------------
//        3) Apply FILTER based on ?status=
//     -------------------------------------------------- */

//     if (status === "booked") {
//       resultSlots = resultSlots.filter(s => s.bookingStatus === "BOOKED");
//     }

//     if (status === "cancelled") {
//       resultSlots = resultSlots.filter(s => s.bookingStatus.startsWith("CANCELLED_BY_RIDER"));
//     }

//     return res.json({
//       success: true,
//       message: "Daily slots fetched",
//       date,
//       weekNumber: dailyDoc.weekNumber,
//       year: dailyDoc.year,
//       count: resultSlots.length,
//       data: resultSlots
//     });

//   } catch (err) {
//     console.error("Get Daily Slots Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };




exports.getDailySlotsWithStatus = async (req, res) => {
  try {
    const riderId = req.rider?._id;
    const { date, city, zone, status = "all" } = req.query;

    if (!date || !city || !zone) {
      return res.status(400).json({
        success: false,
        message: "date, city and zone are required"
      });
    }

    // Get daily slot doc
    const dailyDoc = await Slot.findOne({ date, city, zone });

    if (!dailyDoc) {
      return res.json({
        success: true,
        message: "No slots found for this date",
        data: []
      });
    }

    /* -----------------------------
       Fetch rider bookings for date
    ------------------------------*/
    let bookingMap = {};

    if (riderId) {
      const riderBookings = await SlotBooking.find({ riderId, date });

      for (const b of riderBookings) {
        bookingMap[b.slotId.toString()] = b;
      }
    }

    /* -----------------------------
       Build enriched slot data
    ------------------------------*/
    let enrichedSlots = dailyDoc.slots
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(slot => {
        const booking = bookingMap[slot.slotId.toString()];

        return {
          ...slot._doc,
          isBooked: !!booking && booking.status === "BOOKED",
          isCancelled: !!booking && booking.status === "CANCELLED_BY_RIDER",
          bookingId: booking ? booking._id : null,
          bookingStatus: booking ? booking.status : "NOT_BOOKED"
        };
      });

    /* -----------------------------
       FILTER BASED ON STATUS
    ------------------------------*/

    // Show only booked slots
    if (status === "booked") {
      enrichedSlots = enrichedSlots.filter(s => s.bookingStatus === "BOOKED");
    }

    // Show only cancelled slots
    if (status === "cancelled") {
      enrichedSlots = enrichedSlots.filter(s => s.bookingStatus === "CANCELLED_BY_RIDER");
    }

    if (status === "available" ) {
      enrichedSlots = enrichedSlots.filter(s =>
        s.bookingStatus === "NOT_BOOKED" || s.bookingStatus === "CANCELLED_BY_RIDER"
      );
    }

    return res.json({
      success: true,
      message: "Daily slots fetched",
      date,
      count: enrichedSlots.length,
      data: enrichedSlots
    });

  } catch (err) {
    console.error("Get Daily Slots Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.getDailySlots = async (req, res) => {
  try {
    const { date, city, zone } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)" });
    }
    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!zone) {
      return res.status(400).json({ success: false, message: "Zone is required" });
    }

    const dailyDoc = await Slot.findOne({
      date,
      city,
      zone
    });

    if (!dailyDoc) {
      return res.json({
        success: true,
        message: "No slots found for this date",
        date,
        count: 0,
        data: []
      });
    }

    // Filter ACTIVE slots only
    const activeSlots = dailyDoc.slots
      .filter(s => s.status === "ACTIVE")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return res.json({
      success: true,
      message: "Daily slots fetched",
      date,
      weekNumber: dailyDoc.weekNumber,
      year: dailyDoc.year,
      count: activeSlots.length,
      data: activeSlots
    });

  } catch (err) {
    console.error("Get Daily Slots Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





// exports.bookSlot = async (req, res) => {
//   try {
//     const riderId = req.rider._id;
//     const { date, slotId } = req.body;

//     if (!date || !slotId) {
//       return res.status(400).json({
//         success: false,
//         message: "date and slotId are required"
//       });
//     }

//     // Fetch Rider
//     const rider = await Rider.findById(riderId);
//     if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

//     if (!rider.isFullyRegistered) {
//       return res.status(403).json({
//         success: false,
//         message: "Complete onboarding before booking slots"
//       });
//     }

//     // Get day slot document
//     const daySlot = await Slot.findOne({ date });

//     if (!daySlot) {
//       return res.status(404).json({ success: false, message: "No slots found for this date" });
//     }

//     // Find nested slot
//     const slot = daySlot.slots.find(
//       s => s.slotId.toString() === slotId.toString()
//     );

//     if (!slot) {
//       return res.status(404).json({ success: false, message: "Slot not found" });
//     }

//     if (slot.status !== "ACTIVE") {
//       return res.status(400).json({ success: false, message: "Slot is inactive" });
//     }

//     if (slot.bookedRiders >= slot.maxRiders) {
//       return res.status(400).json({ success: false, message: "Slot is full" });
//     }

//     // Prevent duplicate booking
//     const existing = await SlotBooking.findOne({
//       riderId,
//       date,
//       slotId,
//       status: { $in: ["BOOKED"] }
//     });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "You already booked this slot"
//       });
//     }

//     // ------------------------
//     // AUTO-GENERATE MISSING FIELDS
//     // ------------------------

//     const jsDate = new Date(date);

//     const dayOfWeekArr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
//     const dayOfWeek = dayOfWeekArr[jsDate.getUTCDay()];

//     const dayNumber = jsDate.getUTCDay() === 0 ? 7 : jsDate.getUTCDay(); // SUN=7

//     // slotKey = MON_06_08
//     const slotKey = `${dayOfWeek}_${slot.startTime.replace(":", "")}_${slot.endTime.replace(":", "")}`;

//     const durationMinutes = (slot.durationInHours || 0) * 60;

//     // ------------------------

//     const booking = await SlotBooking.create({
//       riderId,
//       daySlotId: daySlot._id,
//       slotId,
//       slotKey,
//       date,
//       dayOfWeek,
//       dayNumber,
//       weekNumber: daySlot.weekNumber,
//       year: daySlot.year,
//       city: daySlot.city,
//       zone: daySlot.zone,
//       startTime: slot.startTime,
//       endTime: slot.endTime,
//       slotStartAt: new Date(`${date}T${slot.startTime}:00`),
//       slotEndAt: new Date(`${date}T${slot.endTime}:00`),
//       totalMinutes: durationMinutes,
//       isPeakSlot: slot.isPeakSlot,
//       incentiveText: slot.incentiveText,
//       status: "BOOKED",
//       bookedFrom: "APP"
//     });

//     // Increase bookedRiders
//     await Slot.updateOne(
//       { _id: daySlot._id, "slots.slotId": slotId },
//       { $inc: { "slots.$.bookedRiders": 1 } }
//     );

//     return res.json({
//       success: true,
//       message: "Slot booked successfully",
//       data: booking
//     });

//   } catch (err) {
//     console.error("Slot Booking Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


// exports.cancelSlot = async (req, res) => {
//   try {
//     const riderId = req.rider._id;
//     const { bookingId } = req.params;

//     if (!bookingId) {
//       return res.status(400).json({ success: false, message: "bookingId is required" });
//     }

//     // 1) Get Booking
//     const booking = await SlotBooking.findById(bookingId);
//     if (!booking) {
//       return res.status(404).json({ success: false, message: "Booking not found" });
//     }

//     // 2) Ensure booking belongs to rider
//     if (booking.riderId.toString() !== riderId.toString()) {
//       return res.status(403).json({ success: false, message: "Unauthorized cancel attempt" });
//     }

//     // 3) Prevent cancelling past-time slots
//     const slotDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
//     if (slotDateTime < new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot cancel past or ongoing slot"
//       });
//     }

//     // 4) Get the daily slot document
//     const daySlot = await Slot.findById(booking.daySlotId);
//     if (!daySlot) {
//       return res.status(404).json({ success: false, message: "Day slot document missing" });
//     }

//     // 5) Find nested slot
//     const slot = daySlot.slots.find(
//       s => s._id.toString() === booking.slotId.toString()
//     );

//     if (!slot) {
//       return res.status(404).json({ success: false, message: "Slot not found in daily collection" });
//     }

//     // 6) Update booking status
//     booking.status = "CANCELLED_BY_RIDER";
//     await booking.save();

//     // 7) Decrease booked count in nested slot
//     await Slot.updateOne(
//       { _id: daySlot._id, "slots._id": booking.slotId },
//       { $inc: { "slots.$.bookedRiders": -1 } }
//     );

//     return res.json({
//       success: true,
//       message: "Slot cancelled successfully",
//       data: booking
//     });

//   } catch (err) {
//     console.error("Cancel Slot Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.bookSlot = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { date, slotIds } = req.body;

    if (!date || !Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "date and slotIds[] are required"
      });
    }

    // Fetch Rider
    const rider = await Rider.findById(riderId);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    if (!rider.isFullyRegistered) {
      return res.status(403).json({
        success: false,
        message: "Complete onboarding before booking slots"
      });
    }

    // Get day slot document
    const daySlot = await Slot.findOne({ date });
    if (!daySlot) {
      return res.status(404).json({ success: false, message: "No slots found for this date" });
    }

    let validBookings = [];
    let failed = [];

    // Loop each slotId
    for (let slotId of slotIds) {
      const slot = daySlot.slots.find(
        s => s.slotId.toString() === slotId.toString()
      );

      if (!slot) {
        failed.push({ slotId, reason: "Slot not found" });
        continue;
      }

      if (slot.status !== "ACTIVE") {
        failed.push({ slotId, reason: "Slot is inactive" });
        continue;
      }

      if (slot.bookedRiders >= slot.maxRiders) {
        failed.push({ slotId, reason: "Slot is full" });
        continue;
      }

      const already = await SlotBooking.findOne({
        riderId,
        date,
        slotId,
        status: "BOOKED"
      });

      if (already) {
        failed.push({ slotId, reason: "Already booked" });
        continue;
      }

      validBookings.push({ slot, slotId });
    }

    // If nothing can be booked
    if (validBookings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid slots to book",
        failed
      });
    }

    // Prepare date parts
    const jsDate = new Date(date);
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayOfWeek = days[jsDate.getUTCDay()];
    const dayNumber = jsDate.getUTCDay() === 0 ? 7 : jsDate.getUTCDay();

    let createdBookings = [];

    // Create bookings one by one
    for (const item of validBookings) {
      const slot = item.slot;
      const slotId = item.slotId;

      const slotKey = `${dayOfWeek}_${slot.startTime.replace(":", "")}_${slot.endTime.replace(":", "")}`;
      const durationMinutes = (slot.durationInHours || 0) * 60;

      const booking = await SlotBooking.create({
        riderId,
        daySlotId: daySlot._id,
        slotId,
        slotKey,
        date,
        dayOfWeek,
        dayNumber,
        weekNumber: daySlot.weekNumber,
        year: daySlot.year,
        city: daySlot.city,
        zone: daySlot.zone,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotStartAt: new Date(`${date}T${slot.startTime}:00`),
        slotEndAt: new Date(`${date}T${slot.endTime}:00`),
        totalMinutes: durationMinutes,
        isPeakSlot: slot.isPeakSlot,
        incentiveText: slot.incentiveText,
        status: "BOOKED",
        bookedFrom: "APP"
      });

      createdBookings.push(booking);

      // Increase booked count in DB
      await Slot.updateOne(
        { _id: daySlot._id, "slots.slotId": slotId },
        { $inc: { "slots.$.bookedRiders": 1 } }
      );
    }

    // FCM Notification
    const fcmService = require("../helpers/fcmService");
     console.log("Rider FCM Token:", rider?.fcmToken);
    // 3. Send notification
    if (rider?.fcmToken) {
      await fcmService.sendToDevice({
        token: rider.fcmToken,
        title: "Slot Booked ✅",
        body: `Your slot  is booked`,
        data: {
          type: "SLOT_BOOKED",
        },
      });
    }


    return res.json({
      success: true,
      message: "Slots booked successfully",
      bookedCount: createdBookings.length,
      failedCount: failed.length,
      booked: createdBookings,
      failed
    });

  } catch (err) {
    console.error("Slot Booking Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.cancelSlot = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required"
      });
    }

    // 1️⃣ Find booking
    const booking = await SlotBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // 2️⃣ Verify booking belongs to rider
    if (booking.riderId.toString() !== riderId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized cancel attempt"
      });
    }

    // 3️⃣ Prevent cancelling past or ongoing slot
    const slotDateTime = new Date(`${booking.date}T${booking.startTime}:00`);

    // if (slotDateTime <= new Date()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot cancel a past or ongoing slot"
    //   });
    // }

    // 4️⃣ Fetch the daySlot document
    const daySlot = await Slot.findById(booking.daySlotId);
    if (!daySlot) {
      return res.status(404).json({
        success: false,
        message: "Day slot document not found!"
      });
    }

    // 5️⃣ Find nested slot using slotId
    const slot = daySlot.slots.find(
      s => s.slotId.toString() === booking.slotId.toString()
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found inside day slots"
      });
    }

    // 6️⃣ Update booking status
    booking.status = "CANCELLED_BY_RIDER";
    booking.cancellationReason = "Rider cancelled";
    await booking.save();

    // 7️⃣ Decrease nested bookedRiders count
    await Slot.updateOne(
      {
        _id: booking.daySlotId,
        "slots.slotId": booking.slotId
      },
      {
        $inc: { "slots.$.bookedRiders": -1 }
      }
    );

    return res.json({
      success: true,
      message: "Slot cancelled successfully",
      data: booking
    });

  } catch (err) {
    console.error("Cancel Slot Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



exports.getCurrentSlot = async (req, res) => {
  try {
    const { city, zone } = req.query;
    // console.log("City:", city, "Zone:", zone);

    if (!city || !zone) {
      return res.status(400).json({
        success: false,
        message: "city and zone are required"
      });
    }

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const today = now.toISOString().split("T")[0]; // "2025-12-27"
    // console.log("Today's date:", today);
    // Fetch today's slot document
    const daySlot = await Slot.findOne({ date: today, city, zone });

    if (!daySlot || !daySlot.slots.length) {
      return res.json({
        success: true,
        message: "No slots created for today",
        data: null
      });
    }

    // Convert current time to minutes → e.g., 16:27 = 987 minutes
    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    // Find next slot where slot.startTime > current time
    const upcomingSlot = daySlot.slots
      .filter(s => s.status === "ACTIVE")
      .find(s => {
        const [sh, sm] = s.startTime.split(":").map(Number);
        const slotStartMinutes = sh * 60 + sm;
        return slotStartMinutes > currentMinutes;
      });

    if (!upcomingSlot) {
      return res.json({
        success: true,
        message: "No upcoming slots for today",
        data: null
      });
    }

    // testing

    // const todayStr = new Date().toISOString().split("T")[0];
    // console.log("Today String:", todayStr);
    // console.log("Upcoming Slot ID:", today);

    const isBooked = await SlotBooking.exists({
      riderId: req.rider._id,
      slotId: upcomingSlot.slotId,
      date: today,      //STRING MATCH
      status: "BOOKED"
    });

    console.log("Is Booked:", !!isBooked);



    return res.json({
      success: true,
      message: !!isBooked ? "Slot is already booked" : "Present slot",
      date: today,
      data: {
        daySlotId: daySlot._id,
        slot: upcomingSlot,
        isBooked: !!isBooked
      }
    });

  } catch (err) {
    console.error("Current Slot Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



// exports.getSlotHistory = async (req, res) => {
//   try {
//     const riderId = req.rider._id;
//     let { weekNumber, year } = req.query;

//     if (!weekNumber) {
//       return res.status(400).json({
//         success: false,
//         message: "weekNumber is required"
//       });
//     }

//     const currentYear = new Date().getFullYear();
//     year = year || currentYear;

//     // Fetch all bookings for that week
//     const bookings = await SlotBooking.find({
//       riderId,
//       weekNumber: Number(weekNumber),
//       year: Number(year)
//     }).sort({ date: 1, startTime: 1 });

//     /* ------------------------------
//         1. Weekly Summary Counts
//     -------------------------------*/

//     const summary = {
//       totalSlots: bookings.length,
//       completed: bookings.filter(b => b.status === "COMPLETED").length,
//       cancelled: bookings.filter(b => b.status === "CANCELLED_BY_RIDER").length,
//       noShow: bookings.filter(b => b.status === "NO_SHOW").length,
//       failed: bookings.filter(b => b.status === "FAILED").length || 0 // if future logic
//     };

//     /* ------------------------------
//         2. Group bookings by day
//     -------------------------------*/

//     const daysMap = {};

//     bookings.forEach(b => {
//       const dateKey = b.date; // "YYYY-MM-DD"

//       if (!daysMap[dateKey]) {
//         daysMap[dateKey] = {
//           date: dateKey,
//           totalSlots: 0,
//           completed: 0,
//           cancelled: 0,
//           noShow: 0,
//           failed: 0,
//           slots: []
//         };
//       }

//       daysMap[dateKey].slots.push(b);
//       daysMap[dateKey].totalSlots++;

//       if (b.status === "COMPLETED") daysMap[dateKey].completed++;
//       if (b.status === "CANCELLED_BY_RIDER") daysMap[dateKey].cancelled++;
//       if (b.status === "NO_SHOW") daysMap[dateKey].noShow++;
//       if (b.status === "FAILED") daysMap[dateKey].failed++;
//     });

//     // Convert map to array sorted by date
//     const dailyHistory = Object.values(daysMap).sort(
//       (a, b) => new Date(a.date) - new Date(b.date)
//     );

//     /* ------------------------------
//         3. Response
//     -------------------------------*/

//     return res.json({
//       success: true,
//       message: "Weekly slot history fetched",
//       weekNumber: Number(weekNumber),
//       year: Number(year),
//       summary,
//       days: dailyHistory
//     });

//   } catch (err) {
//     console.error("Slot History Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

exports.getSlotHistory = async (req, res) => {
  try {
    const riderId = req.rider._id;
    let { weekNumber, year } = req.query;

    if (!weekNumber) {
      return res.status(400).json({
        success: false,
        message: "weekNumber is required"
      });
    }

    const currentYear = new Date().getFullYear();
    year = Number(year) || currentYear;
    weekNumber = Number(weekNumber);

    /* ----------------------------------------------------
       1. Fetch all bookings for the week
    -----------------------------------------------------*/
    const bookings = await SlotBooking.find({
      riderId,
      weekNumber,
      year
    }).sort({ date: 1, startTime: 1 });

    /* ----------------------------------------------------
       2. Weekly Summary
    -----------------------------------------------------*/
    const summary = {
      totalSlots: bookings.length,
      completed: bookings.filter(b => b.status === "COMPLETED").length,
      cancelled: bookings.filter(b => b.status === "CANCELLED_BY_RIDER").length,
      noShow: bookings.filter(b => b.status === "NO_SHOW").length,
      failed: bookings.filter(b => b.status === "FAILED").length
    };

    /* ----------------------------------------------------
       3. Generate all 7 dates of selected week
    -----------------------------------------------------*/
    function getDateOfISOWeek(w, y) {
      const simple = new Date(y, 0, 1 + (w - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = simple;
      if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      return ISOweekStart;
    }

    const weekStart = getDateOfISOWeek(weekNumber, year);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }

    /* ----------------------------------------------------
       4. Organize bookings by date
    -----------------------------------------------------*/
    const daysMap = {};
    weekDates.forEach(date => {
      daysMap[date] = {
        date,
        totalSlots: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        failed: 0,
        slots: []
      };
    });

    bookings.forEach(b => {
      const dateKey = b.date;

      daysMap[dateKey].slots.push(b);
      daysMap[dateKey].totalSlots++;

      if (b.status === "COMPLETED") daysMap[dateKey].completed++;
      if (b.status === "CANCELLED_BY_RIDER") daysMap[dateKey].cancelled++;
      if (b.status === "NO_SHOW") daysMap[dateKey].noShow++;
      if (b.status === "FAILED") daysMap[dateKey].failed++;
    });

    const dailyHistory = Object.values(daysMap);

    return res.json({
      success: true,
      message: "Weekly slot history fetched",
      weekNumber,
      year,
      summary,
      days: dailyHistory
    });

  } catch (err) {
    console.error("Slot History Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




exports.getCurrentAndNextSlot = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];

    // Fetch today's booked slots
    let todaySlots = await SlotBooking.find({
      riderId,
      date: todayDate,
      status: "BOOKED"
    }).sort({ startTime: 1 });

    // If no slots today, check tomorrow
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split("T")[0];

    let tomorrowSlots = [];
    if (todaySlots.length === 0) {
      tomorrowSlots = await SlotBooking.find({
        riderId,
        date: tomorrow,
        status: "BOOKED"
      }).sort({ startTime: 1 });
    }

    const allSlots = [...todaySlots, ...tomorrowSlots];

    if (allSlots.length === 0) {
      return res.json({
        success: true,
        message: "No booked slots found",
        currentSlot: null,
        nextSlot: null
      });
    }

    let currentSlot = null;
    let nextSlot = null;

    for (let slot of allSlots) {
      const slotStart = new Date(`${slot.date}T${slot.startTime}:00`);
      const slotEnd = new Date(`${slot.date}T${slot.endTime}:00`);

      if (now >= slotStart && now <= slotEnd) {
        currentSlot = slot;
      }

      if (slotStart > now && !nextSlot) {
        nextSlot = slot;
      }
    }

    return res.json({
      success: true,
      message: "Current & next slot fetched",
      currentSlot,
      nextSlot
    });

  } catch (err) {
    console.error("Current/Next Slot Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

