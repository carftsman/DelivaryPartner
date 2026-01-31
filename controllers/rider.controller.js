const Order = require("../models/OrderSchema");
const Rider = require("../models/RiderModel");
const RiderDailyStats = require("../models/RiderDailyStatsSchema");
const SlotHistory = require("../models/SlotModel");

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

exports.getWallet = async (req, res) => {
  try {

    const rider = await Rider.findById(req.rider._id).select(
      "cashInHand deliveryStatus"
    );

    res.json({
      success: true,
      cashInHand: rider.cashInHand?.balance || 0,
      limit: rider.cashInHand?.limit || 2500,
      canTakeOrders: rider.deliveryStatus?.isActive !== false
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Wallet fetch failed"
    });
  }
};
