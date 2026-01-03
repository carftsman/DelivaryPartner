const Order = require("../models/OrderSchema");

/* ============================== HELPERS ============================== */

const getDateRange = (type = "today") => {
  const start = new Date();
  const end = new Date();

  if (type === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (type === "week") {
    const day = start.getDay() || 7; // make Sunday = 7
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);

    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  if (type === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    end.setMonth(start.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

/* ====================== EARNINGS LIST API ====================== */
/**
 * GET /api/rider/earnings/orders?type=today|week|month
 */
const getEarningsOrders = async (req, res) => {
  try {
    if (!req.rider || !req.rider._id) {
      return res.status(401).json({ message: "Unauthorized rider" });
    }

    const riderId = req.rider._id;
    const type = req.query.type || "today";
    const { start, end } = getDateRange(type);

    const orders = await Order.find({
      riderId,
      orderStatus: "DELIVERED",
      createdAt: { $gte: start, $lte: end }
    })
      .select("orderId riderEarning createdAt")
      .sort({ createdAt: -1 })
      .lean();

    let totalEarnings = 0;

    const formattedOrders = orders.map((order) => {
      const amount = order?.riderEarning?.amount || 0;
      totalEarnings += amount;

      return {
        orderId: order.orderId,
        amount,
        completedAt: order.createdAt
      };
    });

    return res.json({
      type,
      totalEarnings,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("getEarningsOrders:", error);
    return res.status(500).json({
      message: "Failed to fetch earnings orders"
    });
  }
};

/* ====================== EARNINGS ORDER DETAIL ====================== */
/**
 * GET /api/rider/earnings/orders/:orderId
 */
const getEarningOrderDetail = async (req, res) => {
  try {
    if (!req.rider || !req.rider._id) {
      return res.status(401).json({ message: "Unauthorized rider" });
    }

    const riderId = req.rider._id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      orderId,
      riderId,
      orderStatus: "DELIVERED"
    }).lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found or not completed"
      });
    }

    const deliveryAmount = order?.riderEarning?.amount || 0;
    const peakHourBonus = order?.peakHourBonus || 0;
    const tax = order?.pricing?.tax || 0;

    return res.json({
      orderId: order.orderId,
      vendorShopName: order.vendorShopName,
      status: "COMPLETED",

      earnings: {
        deliveryAmount,
        peakHourBonus,
        taxAndOtherFees: tax,
        totalEarnings: deliveryAmount + peakHourBonus - tax
      },

      deliveryDetails: {
        distanceInKm: order?.tracking?.distanceInKm || 0,
        durationInMin: order?.tracking?.durationInMin || 0
      },

      deliveredAt: order.updatedAt
    });
  } catch (error) {
    console.error("getEarningOrderDetail:", error);
    return res.status(500).json({
      message: "Failed to fetch order detail"
    });
  }
};

/* ============================== EXPORTS ============================== */

module.exports = {
  getEarningsOrders,
  getEarningOrderDetail
};
