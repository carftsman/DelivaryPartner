const Order = require("../models/Order");
const RiderDailyStats = require("../models/RiderDailyStats");
const { getToday } = require("../utils/date.helper");
const { emitRiderDashboard } = require("../sockets/rider.socket");

exports.markOrderDelivered = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "DELIVERED") {
      return res.status(400).json({ message: "Already Delivered" });
    }

    // -------------------------
    // MARK ORDER DELIVERED
    // -------------------------

    order.orderStatus = "DELIVERED";

    // -------------------------
    // CREDIT RIDER ONLY ONCE
    // -------------------------

    if (!order.riderEarning.credited) {

      const today = getToday();

      let stats = await RiderDailyStats.findOne({
        riderId: order.riderId,
        date: today
      });

      if (!stats) {
        stats = new RiderDailyStats({
          riderId: order.riderId,
          date: today
        });
      }

      // ADD VALUES
      stats.completedOrders += 1;
      stats.totalEarnings += order.riderEarning.totalEarning;

      await stats.save();

      // MARK AS CREDITED
      order.riderEarning.credited = true;
      order.settlement.riderEarningAdded = true;

      // -------------------------
      // REALTIME SOCKET UPDATE
      // -------------------------

      emitRiderDashboard(order.riderId, {

        type: "DASHBOARD_UPDATE",

        daily: {
          completedOrders: stats.completedOrders,
          totalEarnings: stats.totalEarnings
        },

        lastOrder: {
          orderId: order.orderId,
          earning: order.riderEarning.totalEarning
        },

        message: "Order Delivered Successfully"
      });
    }

    await order.save();

    res.json({
      success: true,
      message: "Order delivered & rider dashboard updated"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
