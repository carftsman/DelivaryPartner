const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: { type: String, required: true },
  message: { type: String, required: true },

  type: {
    type: String,
    enum: [
      "ORDER",
      "WALLET",
      "BANK",
      "INCENTIVE",
      "SLOT",
      "SYSTEM"
    ],
    required: true
  },

  // If notification belongs to an order
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  },

  // If notification belongs to offers/incentives
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null
  },

  // Additional dynamic information
  meta: {
    type: Object,
    default: {}
  },

  isRead: {
    type: Boolean,
    default: false
  },

  redirectTo: {
    type: String, 
    enum: [
      "ORDER_DETAILS",
      "WALLET",
      "BANK",
      "INCENTIVE_DETAILS",
      "SLOT_HOME",
      "APP_UPDATE"
    ],
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
