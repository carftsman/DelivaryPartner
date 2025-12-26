const IncentiveSchema = new Schema(
  {
    title: String,
    description: String,
 
    incentiveType: {
      type: String,
      enum: ["PEAK_HOUR", "DAILY_EARNING", "WEEKLY_EARNING"]
    },
 
    rewardType: {
      type: String,
      enum: ["FIXED_AMOUNT", "PER_ORDER", "PERCENTAGE"]
    },
 
    rewardValue: Number,
 
    condition: {
      minOrders: Number,
      minEarning: Number,
      startTime: String,
      endTime: String
    },
 
    maxRewardPerRider: Number,
 
    status: { type: String, enum: ["ACTIVE", "INACTIVE"] }
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Incentive", IncentiveSchema);