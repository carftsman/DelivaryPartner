import mongoose from "mongoose";

/* ===========================
   COMMON SUB SCHEMAS
=========================== */

const OrderItemSchema = new mongoose.Schema({
  itemId: mongoose.Schema.Types.ObjectId,
  itemName: String,
  quantity: Number,
  price: Number,
  total: Number
});

const AddressSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  addressLine: String,
  contactNumber: String
});

/* ===========================
   ORDER
=========================== */

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, index: true },

    vendorId: mongoose.Schema.Types.ObjectId,
    vendorShopName: String,

    customerId: mongoose.Schema.Types.ObjectId,
    riderId: { type: mongoose.Schema.Types.ObjectId, default: null },

    items: [OrderItemSchema],

    pickupAddress: AddressSchema,
    deliveryAddress: AddressSchema,

    pricing: {
      itemTotal: Number,
      deliveryFee: Number,
      tax: Number,
      platformCommission: Number,
      totalAmount: Number
    },

    riderEarning: {
      amount: Number,
      credited: { type: Boolean, default: false }
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
      ],
      default: "CREATED"
    },

    cancelIssue: {
      cancelledBy: {
        type: String,
        enum: ["CUSTOMER", "RIDER", "VENDOR", "ADMIN"]
      },
      reasonCode: String,
      reasonText: String,
      additionalNotes: String,
      reportedAt: Date
    },

    payment: {
      mode: { type: String, enum: ["ONLINE", "COD"] },
      status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"]
      },
      transactionId: String
    },

    tracking: {
      pickupTime: Date,
      deliveredTime: Date,
      distanceInKm: Number,
      durationInMin: Number
    },

    settlement: {
      riderEarningAdded: { type: Boolean, default: false },
      vendorSettled: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

/* ===========================
   INCENTIVE
=========================== */

const IncentiveSchema = new mongoose.Schema(
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
      endTime: String,
      days: [String]
    },

    applicableTo: {
      cityId: mongoose.Schema.Types.ObjectId,
      zoneId: mongoose.Schema.Types.ObjectId
    },

    maxRewardPerRider: Number,

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },

    startDate: Date,
    endDate: Date,

    createdBy: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);

/* ===========================
   RIDER INCENTIVE PROGRESS
=========================== */

const RiderIncentiveProgressSchema = new mongoose.Schema(
  {
    incentiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incentive"
    },

    riderId: mongoose.Schema.Types.ObjectId,

    completedOrders: { type: Number, default: 0 },
    totalEarning: { type: Number, default: 0 },

    progressStatus: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "EXPIRED"],
      default: "IN_PROGRESS"
    },

    lastUpdatedAt: Date
  },
  { timestamps: true }
);

/* ===========================
   INCENTIVE PAYOUT
=========================== */

const IncentivePayoutSchema = new mongoose.Schema(
  {
    incentiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incentive"
    },

    riderId: mongoose.Schema.Types.ObjectId,

    earnedAmount: Number,

    payoutStatus: {
      type: String,
      enum: ["PENDING", "CREDITED"],
      default: "PENDING"
    },

    creditedAt: Date
  },
  { timestamps: true }
);

/* ===========================
   WALLET
=========================== */

const WalletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, index: true },

    userType: {
      type: String,
      enum: ["DELIVERY_PARTNER", "MERCHANT", "PLATFORM"]
    },

    availableBalance: { type: Number, default: 0 },
    blockedBalance: { type: Number, default: 0 },

    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

/* ===========================
   WALLET LEDGER
=========================== */

const WalletLedgerSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      index: true
    },

    entryType: { type: String, enum: ["CREDIT", "DEBIT"] },
    amount: Number,

    referenceType: {
      type: String,
      enum: [
        "ORDER_DELIVERY",
        "ORDER_PAYMENT",
        "REFUND",
        "WITHDRAWAL",
        "PENALTY",
        "ADJUSTMENT"
      ]
    },

    referenceId: mongoose.Schema.Types.ObjectId,

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS"
    },

    balanceAfter: Number
  },
  { timestamps: true }
);

/* ===========================
   BANK ACCOUNT
=========================== */

const BankAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, index: true },

    userType: {
      type: String,
      enum: ["DELIVERY_PARTNER", "MERCHANT"]
    },

    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,

    isVerified: { type: Boolean, default: false },
    verificationRefId: String
  },
  { timestamps: true }
);

/* ===========================
   WITHDRAWAL REQUEST
=========================== */

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet"
    },

    amount: Number,

    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount"
    },

    status: {
      type: String,
      enum: ["INITIATED", "PROCESSING", "SUCCESS", "FAILED"],
      default: "INITIATED"
    },

    provider: {
      type: String,
      enum: ["RAZORPAY", "CASHFREE", "STRIPE"]
    },

    providerRefId: String,
    failureReason: String
  },
  { timestamps: true }
);

/* ===========================
   WALLET ADJUSTMENT
=========================== */

const WalletAdjustmentSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet"
    },

    amount: Number,
    reason: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { timestamps: true }
);

/* ===========================
   MODEL EXPORTS
=========================== */

export const Order = mongoose.model("Order", OrderSchema);
export const Incentive = mongoose.model("Incentive", IncentiveSchema);
export const RiderIncentiveProgress = mongoose.model(
  "RiderIncentiveProgress",
  RiderIncentiveProgressSchema
);
export const IncentivePayout = mongoose.model(
  "IncentivePayout",
  IncentivePayoutSchema
);
export const Wallet = mongoose.model("Wallet", WalletSchema);
export const WalletLedger = mongoose.model("WalletLedger", WalletLedgerSchema);
export const BankAccount = mongoose.model("BankAccount", BankAccountSchema);
export const WithdrawalRequest = mongoose.model(
  "WithdrawalRequest",
  WithdrawalRequestSchema
);
export const WalletAdjustment = mongoose.model(
  "WalletAdjustment",
  WalletAdjustmentSchema
);
