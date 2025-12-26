const RiderIncentiveProgressSchema = new Schema(

  {

    incentiveId: { type: Schema.Types.ObjectId, ref: "Incentive" },

    riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
 
    completedOrders: Number,

    totalEarning: Number,
 
    progressStatus: {

      type: String,

      enum: ["IN_PROGRESS", "COMPLETED", "EXPIRED"]

    },
 
    lastUpdatedAt: Date

  },

  { timestamps: true }

);
 
module.exports = mongoose.model(

  "RiderIncentiveProgress",

  RiderIncentiveProgressSchema

);

 