const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema(
  {
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 53
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

    slots: [
      {
        slotKey: {
          type: String,
          required: true // "MON_06_08"
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

        startTime: {
          type: String,
          required: true
        },

        endTime: {
          type: String,
          required: true
        },

        durationInMinutes: {
          type: Number,
          required: true
        },

        breakInMinutes: {
          type: Number,
          default: 10
        },

        maxRiders: {
          type: Number,
          required: true,
          min: 1
        },

        bookedRiders: {
          type: Number,
          default: 0,
          min: 0
        },

        isAvailable: {
          type: Boolean,
          default: true
        },

        isVisible: {
          type: Boolean,
          default: true
        },

        isLocked: {
          type: Boolean,
          default: false // admin lock
        },

        autoLocked: {
          type: Boolean,
          default: false // system lock
        },

        isPeakSlot: {
          type: Boolean,
          default: false
        },

        incentiveText: {
          type: String,
          default: ""
        },

        incentiveAmount: {
          type: Number,
          default: 0
        },

        priority: {
          type: Number,
          default: 0
        },

        status: {
          type: String,
          enum: ["ACTIVE", "INACTIVE"],
          default: "ACTIVE"
        }
      }
    ],

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

SlotSchema.index({ weekNumber: 1, year: 1, city: 1, zone: 1 });

module.exports = mongoose.model("WeeklySlots", SlotSchema);
