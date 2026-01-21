// const mongoose=require('mongoose')
// const {Schema}=mongoose;
// const OrderSchema = new Schema(
// {
//     orderId: { type: String, index: true },
 
//     // Relations
//     riderId: {
//       type: Schema.Types.ObjectId,
//       ref: "Rider",
//       index: true
//     },
 
//     vendorShopName: {
//       type: String,
//       required: true
//     },
 
//     // Grocery Items
//     items: [
//       {
//         itemName: { type: String, required: true },
//         quantity: { type: Number, required: true },
//         price: { type: Number, required: true },   // per unit
//         total: { type: Number, required: true }    // quantity * price
//       }
//     ],
 
//     // Pickup (Store)
//     pickupAddress: {
//       name: String,
//       lat: Number,
//       lng: Number,
//       addressLine: String,
//       contactNumber: String
//     },
 
//     // Delivery (Customer)
//     deliveryAddress: {
//       name: String,
//       lat: Number,
//       lng: Number,
//       addressLine: String,
//       contactNumber: String
//     },
 
//     // Pricing
//     pricing: {
//       itemTotal: Number,
//       deliveryFee: Number,
//       tax: Number,
//       platformCommission: Number,
//       totalAmount: Number
//     },
 
//     // Rider Earning
//     // Rider Earning
 
//     riderEarning: {
 
//       basePay: {
 
//       type: Number,
 
//       default: 0
 
//     },
 
//     distancePay: {
 
//       type: Number,
 
//       default: 0
 
//     },
 
//     surgePay: {
 
//       type: Number,
 
//       default: 0
 
//     },
 
//     tips: {
 
//       type: Number,
 
//       default: 0
 
//     },
 
//     totalEarning: {
 
//       type: Number,
 
//       default: 0
 
//     },
 
//     credited: {
 
//       type: Boolean,
 
//       default: false
 
//     }
 
//   },
 
 
   
//     // Order Status
//     orderStatus: {
//       type: String,
//       enum: [
//         "CREATED",
//         "CONFIRMED",
//         "ASSIGNED",
//         "PICKED_UP",
//         "DELIVERED",
//         "CANCELLED"
//       ],
//       default: "CREATED",
//       index: true
//     },
 
//     // Cancellation
//     cancelIssue: {
//       cancelledBy: {
//         type: String,
//         enum: ["CUSTOMER", "RIDER", "VENDOR", "ADMIN"]
//       },
//       reasonCode: String,
//       reasonText: String
//     },
 
//     // Payment
//     payment: {
//       mode: {
//         type: String,
//         enum: ["ONLINE", "COD"]
//       },
//       status: {
//         type: String,
//         enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"]
//       },
//       transactionId: String
//     },
 
//     // Tracking summary
//     tracking: {
//       distanceInKm: Number,
//       durationInMin: Number
//     },
 
//     allocation: {
//   candidateRiders: [
//     {
//       riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
//       status: {
//         type: String,
//         enum: ["PENDING", "ACCEPTED", "REJECTED", "TIMEOUT"],
//         default: "PENDING"
//       },
//       notifiedAt: Date
//     }
//   ],
//   assignedAt: Date,
//   expiresAt: Date
// },
 
 
//     // Settlement flags
//     settlement: {
//       riderEarningAdded: { type: Boolean, default: false },
//       vendorSettled: { type: Boolean, default: false }
//     }
//   },
//   { timestamps: true }
// );
 
 
// module.exports = mongoose.model(
//   "Order",
//   OrderSchema,
//   "order"
// );
 
const mongoose=require('mongoose')
const {Schema}=mongoose;
const OrderSchema = new Schema(
{
    orderId: { type: String, index: true },
 
    // Relations
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
      index: true
    },
 
    vendorShopName: {
      type: String,
      required: true
    },
 
    // Grocery Items
    items: [
      {
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },   // per unit
        total: { type: Number, required: true }    // quantity * price
      }
    ],
 
    // Pickup (Store)
    pickupAddress: {
      name: String,
      lat: Number,
      lng: Number,
      addressLine: String,
      contactNumber: String
    },
 
    // Delivery (Customer)
    deliveryAddress: {
      name: String,
      lat: Number,
      lng: Number,
      addressLine: String,
      contactNumber: String
    },
 
    // Pricing
    pricing: {
      itemTotal: Number,
      deliveryFee: Number,
      tax: Number,
      platformCommission: Number,
      totalAmount: Number
    },
 
    // Rider Earning
    // Rider Earning
 
    riderEarning: {
 
      basePay: {
 
      type: Number,
 
      default: 0
 
    },
 
    distancePay: {
 
      type: Number,
 
      default: 0
 
    },
 
    surgePay: {
 
      type: Number,
 
      default: 0
 
    },
 
    tips: {
 
      type: Number,
 
      default: 0
 
    },
 
    totalEarning: {
 
      type: Number,
 
      default: 0
 
    },
 
    credited: {
 
      type: Boolean,
 
      default: false
 
    }
 
  },
 
 
   
    // Order Status
    orderStatus: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "ASSIGNED",
        "PICKED_UP",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "CREATED",
      index: true
    },
 
    // Cancellation
    cancelIssue: {
      cancelledBy: {
        type: String,
        enum: ["CUSTOMER", "RIDER", "VENDOR", "ADMIN"]
      },
      reasonCode: String,
      reasonText: String
    },
 
    // Payment
    payment: {
      mode: {
        type: String,
        enum: ["ONLINE", "COD"]
      },
      status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"]
      },
      transactionId: String
    },
 
    // Tracking summary
    tracking: {
      distanceInKm: Number,
      durationInMin: Number
    },
 
    allocation: {
  candidateRiders: [
    {
      riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED", "TIMEOUT"],
        default: "PENDING"
      },
      notifiedAt: Date
    }
  ],
  assignedAt: Date,
  expiresAt: Date
},
 
 
    // Settlement flags
    settlement: {
      riderEarningAdded: { type: Boolean, default: false },
      vendorSettled: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);
 
 
module.exports = mongoose.model(
  "Order",
  OrderSchema,
  "order"
);