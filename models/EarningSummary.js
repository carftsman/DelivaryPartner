// // models/EarningSummary.js
// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const EarningSummarySchema = new Schema(
//   {
//     riderId: {
//       type: Schema.Types.ObjectId,
//       ref: "Rider",
//       required: true,
//       index: true
//     },

//     date: {
//       type: String, // YYYY-MM-DD
//       required: true,
//       index: true
//     },

//     /* ---- ACTUAL WORK ---- */
//     ordersCompleted: { type: Number, default: 0 },
//     onlineMinutes: { type: Number, default: 0 },

//     /* ---- MONEY ---- */
//     baseEarnings: { type: Number, default: 0 },
//     incentiveEarnings: { type: Number, default: 0 },
//     tipEarnings: { type: Number, default: 0 },

//     penaltyAmount: { type: Number, default: 0 },

//     totalEarnings: { type: Number, default: 0 },

//     /* ---- INCENTIVE SNAPSHOT FOR UI ---- */
//     incentives: [
//       {
//         incentiveId: { type: Schema.Types.ObjectId, ref: "Incentive" },
//         incentiveType: String,

//         minOrders: Number,
//         completedOrders: Number,

//         rewardType: String,
//         rewardValue: Number,

//         earnedAmount: Number,
//         status: String // IN_PROGRESS / COMPLETED
//       }
//     ]
//   },
//   { timestamps: true }
// );

// EarningSummarySchema.index(
//   { riderId: 1, date: 1 },
//   { unique: true }
// );

// module.exports = mongoose.model("EarningSummary", EarningSummarySchema);
