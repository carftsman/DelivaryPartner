const Slot = require("../models/SlotModel");
const getWeekNumber = require("../helpers/getWeekNumber");

const SlotBooking = require("../models/SlotBookingModel");
const Rider = require("../models/RiderModel");


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

    // Combine all active slots day-wise
    const result = weekDocs.map(day => {
      const activeSlots = day.slots
        ?.filter(s => s.status === "ACTIVE")
        ?.sort((a, b) => a.startTime.localeCompare(b.startTime));

      return {
        date: day.date,
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

exports.getDailySlotsWithStatus = async (req, res) => {
  try {
    const riderId = req.rider?._id; // may be optional
    const { date, city, zone, status = "all" } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)" });
    }
    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!zone) {
      return res.status(400).json({ success: false, message: "Zone is required" });
    }

    const dailyDoc = await Slot.findOne({ date, city, zone });

    if (!dailyDoc) {
      return res.json({
        success: true,
        message: "No slots found for this date",
        date,
        count: 0,
        data: []
      });
    }

    /* --------------------------------------------------
       1) Fetch rider bookings for this day
    -------------------------------------------------- */
    let bookingMap = {};

    if (riderId) {
      const riderBookings = await SlotBooking.find({ riderId, date });

      for (const b of riderBookings) {
        bookingMap[b.slotId.toString()] = b;
      }
    }

    /* --------------------------------------------------
       2) Build enriched slot list
    -------------------------------------------------- */
    let resultSlots = dailyDoc.slots
      .filter(s => s.status === "ACTIVE")
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(slot => {
        const booking = bookingMap[slot.slotId?.toString()];
    console.log("result" , resultSlots);
        return {
          ...slot._doc,
          isBooked: !!booking,
          bookingId: booking ? booking._id : null,
          bookingStatus: booking ? booking.status : "NOT_BOOKED"
        };
      });

    /* --------------------------------------------------
       3) Apply FILTER based on ?status=
    -------------------------------------------------- */

    if (status === "booked") {
      resultSlots = resultSlots.filter(s => s.bookingStatus === "BOOKED");
    }

    if (status === "cancelled") {
      resultSlots = resultSlots.filter(s => s.bookingStatus.startsWith("CANCELLED_BY_RIDER"));
    }

    return res.json({
      success: true,
      message: "Daily slots fetched",
      date,
      weekNumber: dailyDoc.weekNumber,
      year: dailyDoc.year,
      count: resultSlots.length,
      data: resultSlots
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

//     // Find rider
//     const rider = await Rider.findById(riderId);
//     if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

//     if (!rider.isFullyRegistered) {
//       return res.status(403).json({
//         success: false,
//         message: "Complete onboarding before booking slots"
//       });
//     }

//     // Find the day's slot document
//     const daySlot = await Slot.findOne({date});

//     if (!daySlot) {
//       return res.status(404).json({ success: false, message: "No slots found for this date" });
//     }

//     // Find slot inside nested slots[]
//     const slot = daySlot.slots.find(s => s.slotId.toString() === slotId.toString());

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
//       slotId
//     });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "You already booked this slot"
//       });
//     }

//     // CREATE BOOKING → FIXED (INCLUDE daySlotId)
//     const booking = await SlotBooking.create({
//       riderId,
//       daySlotId: daySlot._id,        // 100% REQUIRED
//       slotId,                        // nested slotId
//       slotKey: slot.slotKey || "",   // optional
//       date,
//       dayOfWeek: slot.dayOfWeek,
//       dayNumber: slot.dayNumber,
//       weekNumber: daySlot.weekNumber,
//       year: daySlot.year,
//       city: daySlot.city,
//       zone: daySlot.zone,
//       startTime: slot.startTime,
//       endTime: slot.endTime,
//       slotStartAt: new Date(`${date}T${slot.startTime}:00`),
//       slotEndAt: new Date(`${date}T${slot.endTime}:00`),
//       totalMinutes: slot.durationInHours * 60,
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

exports.bookSlot = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { date, slotId } = req.body;

    if (!date || !slotId) {
      return res.status(400).json({
        success: false,
        message: "date and slotId are required"
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

    // Find nested slot
    const slot = daySlot.slots.find(
      s => s.slotId.toString() === slotId.toString()
    );

    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    if (slot.status !== "ACTIVE") {
      return res.status(400).json({ success: false, message: "Slot is inactive" });
    }

    if (slot.bookedRiders >= slot.maxRiders) {
      return res.status(400).json({ success: false, message: "Slot is full" });
    }

    // Prevent duplicate booking
    const existing = await SlotBooking.findOne({
      riderId,
      date,
      slotId,
      status: { $in: ["BOOKED"] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already booked this slot"
      });
    }

    // ------------------------
    // AUTO-GENERATE MISSING FIELDS
    // ------------------------

    const jsDate = new Date(date);

    const dayOfWeekArr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayOfWeek = dayOfWeekArr[jsDate.getUTCDay()];

    const dayNumber = jsDate.getUTCDay() === 0 ? 7 : jsDate.getUTCDay(); // SUN=7

    // slotKey = MON_06_08
    const slotKey = `${dayOfWeek}_${slot.startTime.replace(":", "")}_${slot.endTime.replace(":", "")}`;

    const durationMinutes = (slot.durationInHours || 0) * 60;

    // ------------------------

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

    // Increase bookedRiders
    await Slot.updateOne(
      { _id: daySlot._id, "slots.slotId": slotId },
      { $inc: { "slots.$.bookedRiders": 1 } }
    );

    return res.json({
      success: true,
      message: "Slot booked successfully",
      data: booking
    });

  } catch (err) {
    console.error("Slot Booking Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


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

    const now = new Date();
    const today = now.toISOString().split("T")[0]; // "2025-12-27"
    console.log("Today's date:", today);
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

    return res.json({
      success: true,
      message: "Upcoming slot for today",
      date: today,
      data: {
        daySlotId: daySlot._id,
        slot: upcomingSlot
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
