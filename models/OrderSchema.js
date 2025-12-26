const OrderSchema = new Schema(
  {
    orderId: { type: String, index: true },
 
    riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
 
    vendorShopName: String,
 
    items: [
      {
        itemName: String,
        quantity: Number,
        price: Number,
        total: Number
      }
    ],
 
    pickupAddress: {
      name: String,
      lat: Number,
      lng: Number,
      addressLine: String,
      contactNumber: String
    },
 
    deliveryAddress: {
      name: String,
      lat: Number,
      lng: Number,
      addressLine: String,
      contactNumber: String
    },
 
    pricing: {
      itemTotal: Number,
      deliveryFee: Number,
      tax: Number,
      platformCommission: Number,
      totalAmount: Number
    },
 
    riderEarning: {
      amount: Number,
      credited: Boolean
    },
 
    orderStatus: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "ASSIGNED",
        "PICKED_UP",
        "DELIVERED",
        "CANCELLED"
      ]
    },
 
    cancelIssue: {
      cancelledBy: String,
      reasonCode: String,
      reasonText: String
    },
 
    payment: {
      mode: { type: String, enum: ["ONLINE", "COD"] },
      status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"] },
      transactionId: String
    },
 
    tracking: {
      distanceInKm: Number,
      durationInMin: Number
    },
 
    settlement: {
      riderEarningAdded: Boolean,
      vendorSettled: Boolean
    }
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Order", OrderSchema);