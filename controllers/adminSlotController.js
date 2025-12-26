const WeeklySlots = require("../models/SlotModel");

/**
 * convert HH:mm to minutes
 */
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Check overlapping slots
 */
const hasOverlap = (slots) => {
  const grouped = {};

  for (const slot of slots) {
    if (!grouped[slot.dayNumber]) grouped[slot.dayNumber] = [];
    grouped[slot.dayNumber].push(slot);
  }

  for (const day in grouped) {
    const daySlots = grouped[day]
      .map(s => ({
        start: timeToMinutes(s.startTime),
        end: timeToMinutes(s.endTime)
      }))
      .sort((a, b) => a.start - b.start);

    for (let i = 1; i < daySlots.length; i++) {
      if (daySlots[i].start < daySlots[i - 1].end) {
        return true;
      }
    }
  }

  return false;
};

exports.createWeeklySlots = async (req, res) => {
  try {
    const { weekNumber, year, city, zone, slots } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!weekNumber || !year || !city || !zone || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "weekNumber, year, city, zone and slots are required"
      });
    }

    /* ----------- PREVENT DUPLICATE WEEK CREATION ----------- */
    const exists = await WeeklySlots.findOne({
      weekNumber,
      year,
      city,
      zone,
      isDeleted: false
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Slots already created for this week and zone"
      });
    }

    /* ----------- DUPLICATE SLOT KEY CHECK ----------- */
    const slotKeys = slots.map(s => s.slotKey);
    if (new Set(slotKeys).size !== slotKeys.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate slotKey found"
      });
    }

    /* ----------- SLOT LEVEL VALIDATION ----------- */
    for (const slot of slots) {
      if (timeToMinutes(slot.startTime) >= timeToMinutes(slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: `Invalid time range for slot ${slot.slotKey}`
        });
      }

      // Auto-calculate duration
      slot.durationInMinutes =
        timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);

      // SlotKey vs Day mismatch
      if (!slot.slotKey.startsWith(slot.dayOfWeek)) {
        return res.status(400).json({
          success: false,
          message: `slotKey does not match dayOfWeek for ${slot.slotKey}`
        });
      }

      // Incentive rule
      if (slot.incentiveAmount > 0 && !slot.isPeakSlot) {
        return res.status(400).json({
          success: false,
          message: `Incentive allowed only for peak slots (${slot.slotKey})`
        });
      }

      // Inactive slot safety
      if (slot.status === "INACTIVE") {
        slot.isAvailable = false;
        slot.isVisible = false;
        slot.isLocked = true;
      }
    }

    /* ----------- OVERLAP CHECK ----------- */
    if (hasOverlap(slots)) {
      return res.status(400).json({
        success: false,
        message: "Overlapping slots detected"
      });
    }

    /* ----------- SAVE WEEKLY SLOTS ----------- */
    const weeklySlots = await WeeklySlots.create({
      weekNumber,
      year,
      city,
      zone,
      slots
    });

    return res.status(201).json({
      success: true,
      message: "Weekly slots created successfully",
      data: {
        id: weeklySlots._id,
        weekNumber,
        year,
        city,
        zone
      }
    });

  } catch (error) {
    console.error("CREATE SLOT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};





