const mongoose = require("mongoose");

const SlotBookingSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true,
      index: true
    },

    weeklySlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklySlots",
      required: true
    },

    slotKey: {
      type: String,
      required: true // "TUE_08_10"
    },

    date: {
      type: Date,
      required: true,
      index: true
    },

    dayOfWeek: {
      type: String,
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      required: true
    },

    dayNumber: {
      type: Number,
      min: 1,
      max: 7,
      required: true
    },

    weekNumber: {
      type: Number,
      required: true
    },

    year: {
      type: Number,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    zone: {
      type: String,
      required: true
    },

    startTime: {
      type: String,
      required: true // "08:00"
    },

    endTime: {
      type: String,
      required: true // "10:00"
    },

    /* CRITICAL FIELDS */
    slotStartAt: {
      type: Date,
      required: true,
      index: true
    },

    slotEndAt: {
      type: Date,
      required: true
    },

    totalMinutes: {
      type: Number,
      required: true
    },

    isPeakSlot: {
      type: Boolean,
      default: false
    },

    incentiveText: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "BOOKED",
        "CANCELLED_BY_RIDER",
        "CANCELLED_BY_SYSTEM",
        "COMPLETED",
        "NO_SHOW"
      ],
      default: "BOOKED",
      index: true
    },

    bookedFrom: {
      type: String,
      enum: ["APP", "ADMIN"],
      default: "APP"
    }
  },
  { timestamps: true }
);


// Prevent same rider booking same slot again

SlotBookingSchema.index(
  { riderId: 1, date: 1, slotKey: 1 },
  { unique: true }
);

module.exports = mongoose.model("SlotBooking", SlotBookingSchema);
