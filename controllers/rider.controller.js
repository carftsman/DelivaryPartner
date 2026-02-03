const Order = require("../models/OrderSchema");
const Rider = require("../models/RiderModel");
// const CashDeposit = require("../models/CashDeposit");
// const WalletTransaction = require("../models/WalletTransaction");

// ==============================
// DELIVER ORDER (POST)
// ==============================

exports.markDelivered = async (req, res) => {
  try {

    // ✅ KEEP AS ObjectId
    const riderId = req.rider._id;
    const { orderId } = req.body;

    const order = await Order.findOne({
      orderId,
      riderId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.riderEarning?.credited === true) {
      return res.json({
        success: false,
        message: "Order already settled"
      });
    }

    // ONLINE payment safety
    if (
      order.payment?.mode === "ONLINE" &&
      order.payment?.status !== "SUCCESS"
    ) {
      return res.status(400).json({
        success: false,
        message: "Online payment not successful"
      });
    }

    // -----------------------------
    // UPDATE ORDER
    // -----------------------------

    order.orderStatus = "DELIVERED";
    order.riderEarning.credited = true;

    await order.save();

    const earning = order.riderEarning.totalEarning || 0;
    const paymentMode = order.payment.mode;
    const codAmount = order.pricing.totalAmount || 0;

    // IST SAFE DATE
    const today = new Date().toLocaleDateString("en-CA");

    // -----------------------------
    // DAILY STATS
    // -----------------------------

    await RiderDailyStats.findOneAndUpdate(
      { riderId, date: today },
      {
        $inc: {
          totalOrders: 1,
          totalEarnings: earning
        },
        $setOnInsert: {
          riderId,
          date: today
        }
      },
      { upsert: true }
    );

    // -----------------------------
    // SLOT HISTORY
    // -----------------------------

    const slotType = order.slotType || "NORMAL";

    await SlotHistory.findOneAndUpdate(
      { riderId, date: today, slotType },
      {
        $inc: {
          completedOrders: 1,
          earnings: earning
        },
        $setOnInsert: {
          riderId,
          date: today,
          slotType
        }
      },
      { upsert: true }
    );

    // -----------------------------
    // COD CASH HANDLING
    // -----------------------------

    let cashLimitExceeded = false;

    if (paymentMode === "COD") {

      const rider = await Rider.findById(riderId);

      const currentCash =
        rider.cashInHand?.balance || 0;

      const updatedCash = currentCash + codAmount;

      const updateObj = {
        cashInHand: {
          balance: updatedCash,
          limit: 2500,
          lastUpdatedAt: new Date()
        }
      };

      if (updatedCash > 2500) {

        updateObj.deliveryStatus = {
          isActive: false,
          inactiveReason: "COD_LIMIT_EXCEEDED",
          updatedAt: new Date()
        };

        cashLimitExceeded = true;
      }

      await Rider.findByIdAndUpdate(riderId, updateObj);
    }

    res.json({
      success: true,
      message: "Order delivered successfully",
      data: {
        orderId,
        earningAdded: earning,
        codCollected: paymentMode === "COD" ? codAmount : 0,
        cashLimitExceeded
      }
    });

  } catch (err) {

    console.error("DELIVERY ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Delivery update failed"
    });
  }
};

// ==============================
// DASHBOARD (GET)
// ==============================

exports.getDashboard = async (req, res) => {
  try {

    const riderId = req.rider._id;
    const today = new Date().toLocaleDateString("en-CA");

    const stats = await RiderDailyStats.findOne({
      riderId,
      date: today
    });

    res.json({
      success: true,
      totalOrders: stats?.totalOrders || 0,
      totalEarnings: stats?.totalEarnings || 0
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Dashboard fetch failed"
    });
  }
};

// ==============================
// ORDERS HISTORY (GET)
// ==============================

exports.getOrders = async (req, res) => {
  try {

    const riderId = req.rider._id;

    const { status } = req.query;

    const filter = {
      riderId: riderId   // ObjectId match
    };

    if (status) {
      filter.orderStatus = status;
    }

    console.log("ORDERS FILTER:", filter);

    const orders = await Order.find(filter).lean();

    console.log("FOUND ORDERS:", orders.length);

    res.json({
      success: true,
      totalOrders: orders.length,
      data: orders
    });

  } catch (err) {

    console.error("ORDER FETCH ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Order history fetch failed"
    });
  }
};

// ==============================
// SLOT HISTORY (GET)
// ==============================

exports.getSlotHistory = async (req, res) => {
  try {

    const riderId = req.rider._id;

    const date =
      req.query.date || new Date().toLocaleDateString("en-CA");

    const slots = await SlotHistory.find({
      riderId,
      date
    });

    res.json({
      success: true,
      totalSlots: slots.length,
      data: slots
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Slot history fetch failed"
    });
  }
};

// ==============================
// WALLET (GET)
// ==============================



exports.getCashInHand = async (req, res) => {
  try {
    if (!req.rider || !req.rider._id) {
      return res.status(400).json({
        success: false,
        message: "Rider info missing"
      });
    }

    const riderId = req.rider._id;

    // 1️⃣ Get rider cashInHand
    const rider = await Rider.findById(riderId).select("cashInHand").lean();
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    const cashLimit = rider.cashInHand?.limit || 2500;
    const cashBalance = rider.cashInHand?.balance || 0;

    // 2️⃣ Fetch COD orders (delivered or pending)
    const orders = await Order.find({
      riderId,
      "payment.mode": "COD"
    })
      .select(
        "orderId deliveryAddress.name cod.amount cod.status cod.collectedAt cod.depositedAt"
      )
      .sort({ "cod.collectedAt": -1 })
      .lean();

    let pendingOrdersCount = 0;
    let pendingAmount = 0;

    const cashOrderHistory = orders.map((order) => {
      const amount = order.cod?.amount ?? 0;
      const status = order.cod?.status ?? "PENDING";

      if (status === "PENDING") {
        pendingOrdersCount++;
        pendingAmount += amount;
      }

      return {
        orderId: order.orderId,
        customerName: order.deliveryAddress?.name || "Customer",
        amount,
        status,
        collectedAt: order.cod?.collectedAt || null,
        depositedAt: order.cod?.depositedAt || null
      };
    });

    // 3️⃣ Use rider's cashInHand.balance as totalCashCollected
    const totalCashCollected = cashBalance;

    return res.status(200).json({
      success: true,
      data: {
        cashSummary: {
          totalCashCollected,
          currency: "INR",
          toDeposit: pendingAmount,
          depositRequired: pendingAmount > cashLimit
        },
        lastDeposit: 0, // No CashDeposit model used
        pendingOrdersSummary: {
          pendingOrdersCount,
          pendingAmount
        },
        cashOrderHistory,
        rules: {
          depositWithinHours: 24,
          warningMessage:
            "Cash must be deposited within 24 hours of collection. Failure to deposit may result in account suspension."
        }
      }
    });
  } catch (error) {
    console.error("CASH SUMMARY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cash summary"
    });
  }
};



exports.getWallet = async (req, res) => {
  try {
    const riderId = req.rider._id;

    // 1️⃣ Fetch rider info
    const rider = await Rider.findById(riderId)
      .select("wallet cashInHand bankDetails")
      .lean();

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    // 2️⃣ Calculate pending COD from delivered orders
    const codOrders = await Order.find({
      riderId,
      "payment.mode": "COD",
      orderStatus: "DELIVERED",
      "cod.status": "PENDING"
    }).select("cod.amount").lean();

    const pendingCodAmount = codOrders.reduce(
      (sum, o) => sum + (o.cod?.amount || 0),
      0
    );

    // 3️⃣ Determine actions
    const actions = {
      canWithdraw: rider.wallet.balance >= 500, // Minimum withdrawal threshold
      canAddMoney: true,
      bankLinked: !!(
        rider.bankDetails &&
        rider.bankDetails.addedBankAccount &&
        rider.bankDetails.verifiedAt
      )
    };

    // 4️⃣ Build response
    return res.status(200).json({
      success: true,
      data: {
        walletSummary: {
          availableBalance: rider.wallet.balance, // Only wallet balance
          pendingCodAmount,                       // Pending COD
          currency: "INR",
          actions
        },
        recentTransactions: [] // No transaction history table
      }
    });

  } catch (error) {
    console.error("WALLET SUMMARY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet summary"
    });
  }
};
