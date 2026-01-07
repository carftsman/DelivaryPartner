// const mongoose = require("mongoose");
// const Order = require("../models/OrderSchema");
// const EarningSummary = require("../models/EarningSummary");
// const Rider = require("../models/RiderModel");

// /* ============================== HELPERS ============================== */

// const today = () => new Date().toISOString().slice(0, 10);

// const getDateRange = (type = "today") => {
//   const start = new Date();
//   const end = new Date();

//   if (type === "today") {
//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);
//   }

//   if (type === "week") {
//     const day = start.getDay() || 7;
//     start.setDate(start.getDate() - day + 1);
//     start.setHours(0, 0, 0, 0);

//     end.setDate(start.getDate() + 6);
//     end.setHours(23, 59, 59, 999);
//   }

//   if (type === "month") {
//     start.setDate(1);
//     start.setHours(0, 0, 0, 0);

//     end.setMonth(start.getMonth() + 1, 0);
//     end.setHours(23, 59, 59, 999);
//   }

//   return { start, end };
// };



// const getMonthEarnings = async (req, res) => {
//   try {
//     const riderId = req.rider._id;
//     const { start, end } = getDateRange("month");

//     const orders = await Order.find({
//       riderId,
//       orderStatus: "DELIVERED",
//       createdAt: { $gte: start, $lte: end }
//     })
//       .select("orderId riderEarning createdAt")
//       .sort({ createdAt: -1 })
//       .lean();

//     let totalEarnings = 0;

//     const orderList = orders.map(o => {
//       const amount = o?.riderEarning?.amount || 0;
//       totalEarnings += amount;

//       return {
//         orderId: o.orderId,
//         amount,
//         completedAt: o.createdAt
//       };
//     });

//     return res.json({
//       range: "month",
//       totalEarnings,
//       totalOrders: orderList.length,
//       orders: orderList
//     });
//   } catch (error) {
//     console.error("getMonthEarnings error:", error);
//     return res.status(500).json({ message: "Failed to fetch month earnings" });
//   }
// };



// const getWeekEarnings = async (req, res) => {
//   try {
//     if (!req.rider?._id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const riderId = req.rider._id;
//     const { start, end } = getDateRange("week");

//     const orders = await Order.find({
//       riderId,
//       orderStatus: "DELIVERED",
//       createdAt: { $gte: start, $lte: end }
//     })
//       .select("orderId riderEarning createdAt")
//       .sort({ createdAt: -1 })
//       .lean();

//     let totalEarnings = 0;

//     const orderList = orders.map(o => {
//       const amount = o?.riderEarning?.amount || 0;
//       totalEarnings += amount;

//       return {
//         orderId: o.orderId,
//         amount,
//         completedAt: o.createdAt
//       };
//     });

//     return res.json({
//       range: "week",
//       totalEarnings,
//       totalOrders: orderList.length,
//       orders: orderList
//     });
//   } catch (error) {
//     console.error("getWeekEarnings error:", error);
//     return res.status(500).json({ message: "Failed to fetch week earnings" });
//   }
// };


// const getEarningsSummary = async (req, res) => {
//   try {
//     if (!req.rider || !req.rider._id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const riderId = new mongoose.Types.ObjectId(req.rider._id);
//     const todayDate = today();
//     const monthStart = todayDate.slice(0, 7) + "-01";

//     const todayData = await EarningSummary.findOne(
//       { riderId, date: todayDate },
//       { totalEarnings: 1 }
//     ).lean();

//     const monthAgg = await EarningSummary.aggregate([
//       { $match: { riderId, date: { $gte: monthStart } } },
//       { $group: { _id: null, total: { $sum: "$totalEarnings" } } }
//     ]);

//     return res.json({
//       todayEarnings: todayData?.totalEarnings || 0,
//       monthEarnings: monthAgg[0]?.total || 0
//     });
//   } catch (error) {
//     console.error("getEarningsSummary error:", error);
//     return res.status(500).json({ message: "Failed to fetch summary" });
//   }
// };

// /* ====================== WALLET ====================== */
// /**
//  * GET /api/earnings/wallet
//  */
// const getWallet = async (req, res) => {
//   try {
//     if (!req.rider?._id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const rider = await Rider.findById(req.rider._id).select("wallet");

//     res.json({
//       balance: rider?.wallet?.balance || 0,
//       totalEarned: rider?.wallet?.totalEarned || 0,
//       totalWithdrawn: rider?.wallet?.totalWithdrawn || 0
//     });
//   } catch (error) {
//     console.error("getWallet:", error);
//     res.status(500).json({ message: "Failed to fetch wallet" });
//   }
// };

// /* ====================== EARNINGS LIST ====================== */
// /**
//  * GET /api/earnings/orders
//  */
// const getEarningsOrders = async (req, res) => {
//   try {
//     const riderId = req.rider._id;
//     const type = req.query.type || "today";
//     const { start, end } = getDateRange(type);

//     const orders = await Order.find({
//       riderId,
//       orderStatus: "DELIVERED",
//       createdAt: { $gte: start, $lte: end }
//     })
//       .select("orderId riderEarning createdAt")
//       .sort({ createdAt: -1 })
//       .lean();

//     let totalEarnings = 0;

//     const result = orders.map(o => {
//       const amount = o?.riderEarning?.amount || 0;
//       totalEarnings += amount;

//       return {
//         orderId: o.orderId,
//         amount,
//         completedAt: o.createdAt
//       };
//     });

//     res.json({ type, totalEarnings, orders: result });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch earnings" });
//   }
// };

// /* ====================== EARNINGS DETAIL ====================== */
// /**
//  * GET /api/earnings/orders/:orderId
//  */
// const getEarningOrderDetail = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       riderId: req.rider._id,
//       orderId: req.params.orderId,
//       orderStatus: "DELIVERED"
//     }).lean();

//     if (!order) {
//       return res.status(404).json({
//         message: "Order not found or not completed"
//       });
//     }

//     const deliveryAmount = order?.riderEarning?.amount || 0;
//     const peakHourBonus = order?.peakHourBonus || 0;
//     const tax = order?.pricing?.tax || 0;

//     res.json({
//       orderId: order.orderId,
//       vendorShopName: order.vendorShopName,
//       status: "COMPLETED",
//       earnings: {
//         deliveryAmount,
//         peakHourBonus,
//         taxAndOtherFees: tax,
//         totalEarnings: deliveryAmount + peakHourBonus - tax
//       },
//       deliveryDetails: {
//         distanceInKm: order?.tracking?.distanceInKm || 0,
//         durationInMin: order?.tracking?.durationInMin || 0
//       },
//       deliveredAt: order.updatedAt
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch order detail" });
//   }
// };

// const getDayEarnings = async (req, res) => {
//   try {
//     if (!req.rider?._id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const riderId = req.rider._id;

//     // date from query OR default today
//     const dateParam = req.query.date; // YYYY-MM-DD
//     const targetDate = dateParam
//       ? new Date(dateParam)
//       : new Date();

//     // start & end of the day
//     const start = new Date(targetDate);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(targetDate);
//     end.setHours(23, 59, 59, 999);

//     const orders = await Order.find({
//       riderId,
//       orderStatus: "DELIVERED",
//       createdAt: { $gte: start, $lte: end }
//     })
//       .select("orderId riderEarning createdAt")
//       .sort({ createdAt: -1 })
//       .lean();

//     let totalEarnings = 0;

//     const orderList = orders.map(order => {
//       const amount = order?.riderEarning?.amount || 0;
//       totalEarnings += amount;

//       return {
//         orderId: order.orderId,
//         amount,
//         completedAt: order.createdAt
//       };
//     });

//     return res.json({
//       date: start.toISOString().slice(0, 10),
//       totalEarnings,
//       totalOrders: orderList.length,
//       orders: orderList
//     });
//   } catch (error) {
//     console.error("getDayEarnings error:", error);
//     return res.status(500).json({
//       message: "Failed to fetch day earnings"
//     });
//   }
// };


// module.exports = {
//   getEarningsOrders,
//   getEarningOrderDetail,
//   getMonthEarnings,
//   getEarningsSummary,
//   getWallet,
//   getWeekEarnings,
//   getDayEarnings
// };


const mongoose = require("mongoose");
const Order = require("../models/OrderSchema");
const EarningSummary = require("../models/EarningSummary");
const Rider = require("../models/RiderModel");

/* ============================== HELPERS ============================== */

const today = () => new Date().toISOString().slice(0, 10);

const getDateRange = (type = "today", dateParam) => {
  const start = new Date();
  const end = new Date();
  console.log(start)
  if (type === "day" || type === "today") {
    const target = dateParam ? new Date(dateParam) : new Date();
    
    start.setTime(target.getTime());
    start.setHours(0, 0, 0, 0);


    end.setTime(target.getTime());
    end.setHours(23, 59, 59, 999);

        console.log(target , "    helo   ", start   , "  ", end)

  }

  if (type === "week") {
    const day = start.getDay() || 7;
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

const calculateRiderEarnings = (riderEarning = {}) => {
  const basePay = riderEarning.basePay || 0;
  const distancePay = riderEarning.distancePay || 0;
  const surgePay = riderEarning.surgePay || 0;
  const tips = riderEarning.tips || 0;

  return {
    basePay,
    distancePay,
    surgePay,
    tips,
    total: basePay + distancePay + surgePay + tips
  };
};

/* ====================== DAY EARNINGS ====================== */
/**
 * GET /api/earnings/day?date=YYYY-MM-DD
 */
const getDayEarnings = async (req, res) => {
  try {
    if (!req.rider?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const riderId = req.rider._id;
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const daySummary = await EarningSummary.findOne({
      riderId,
      date
    }).lean();

    if (!daySummary) {
      return res.json({
        date,
        totalEarnings: 0,
        ordersCompleted: 0,
        earnings: {
          baseEarnings: 0,
          incentiveEarnings: 0,
          tipEarnings: 0,
          penaltyAmount: 0
        }
      });
    }

    res.json({
      date: daySummary.date,
      ordersCompleted: daySummary.ordersCompleted,
      onlineMinutes: daySummary.onlineMinutes,
      earnings: {
        baseEarnings: daySummary.baseEarnings,
        incentiveEarnings: daySummary.incentiveEarnings,
        tipEarnings: daySummary.tipEarnings,
        penaltyAmount: daySummary.penaltyAmount
      },
      totalEarnings: daySummary.totalEarnings,
      incentives: daySummary.incentives || []
    });
  } catch (error) {
    console.error("getDayEarnings error:", error);
    res.status(500).json({ message: "Failed to fetch day earnings" });
  }
};


/* ====================== WEEK EARNINGS ====================== */
/**
 * GET /api/earnings/week
 */
const getWeekEarnings = async (req, res) => {
  try {
    if (!req.rider?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const riderId = req.rider._id;
    const { start, end } = getDateRange("week");

    const orders = await Order.find({
      riderId,
      orderStatus: "DELIVERED",
      createdAt: { $gte: start, $lte: end }
    })
      .select("orderId riderEarning createdAt")
      .sort({ createdAt: -1 })
      .lean();

    let totalEarnings = 0;

    const orderList = orders.map(order => {
      const earnings = calculateRiderEarnings(order.riderEarning);
      totalEarnings += earnings.total;

      return {
        orderId: order.orderId,
        ...earnings,
        completedAt: order.createdAt
      };
    });

    res.json({
      range: "week",
      from: start,
      to: end,
      totalEarnings,
      totalOrders: orderList.length,
      orders: orderList
    });
  } catch (error) {
    console.error("getWeekEarnings error:", error);
    res.status(500).json({ message: "Failed to fetch week earnings" });
  }
};

/* ====================== MONTH EARNINGS ====================== */
/**
 * GET /api/earnings/month
 */
const getMonthEarnings = async (req, res) => {
  try {
    if (!req.rider?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const riderId = req.rider._id;
    const { start, end } = getDateRange("month");

    const orders = await Order.find({
      riderId,
      orderStatus: "DELIVERED",
      createdAt: { $gte: start, $lte: end }
    })
      .select("orderId riderEarning createdAt")
      .sort({ createdAt: -1 })
      .lean();

    let totalEarnings = 0;

    const orderList = orders.map(order => {
      const earnings = calculateRiderEarnings(order.riderEarning);
      totalEarnings += earnings.total;

      return {
        orderId: order.orderId,
        ...earnings,
        completedAt: order.createdAt
      };
    });

    res.json({
      range: "month",
      month: start.toISOString().slice(0, 7),
      totalEarnings,
      totalOrders: orderList.length,
      orders: orderList
    });
  } catch (error) {
    console.error("getMonthEarnings error:", error);
    res.status(500).json({ message: "Failed to fetch month earnings" });
  }
};

/* ====================== EARNINGS SUMMARY ====================== */
/**
 * GET /api/earnings/summary
 */
const getEarningsSummary = async (req, res) => {
  try {
    if (!req.rider?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const riderId = new mongoose.Types.ObjectId(req.rider._id);
    const todayDate = today();
    const monthStart = todayDate.slice(0, 7) + "-01";

    const todayData = await EarningSummary.findOne(
      { riderId, date: todayDate },
      { totalEarnings: 1 }
    ).lean();

    const monthAgg = await EarningSummary.aggregate([
      { $match: { riderId, date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$totalEarnings" } } }
    ]);

    res.json({
      todayEarnings: todayData?.totalEarnings || 0,
      monthEarnings: monthAgg[0]?.total || 0
    });
  } catch (error) {
    console.error("getEarningsSummary error:", error);
    res.status(500).json({ message: "Failed to fetch earnings summary" });
  }
};

/* ====================== WALLET ====================== */
/**
 * GET /api/earnings/wallet
 */
const getWallet = async (req, res) => {
  try {
    const rider = await Rider.findById(req.rider._id).select("wallet");

    res.json({
      balance: rider?.wallet?.balance || 0,
      totalEarned: rider?.wallet?.totalEarned || 0,
      totalWithdrawn: rider?.wallet?.totalWithdrawn || 0
    });
  } catch (error) {
    console.error("getWallet error:", error);
    res.status(500).json({ message: "Failed to fetch wallet" });
  }
};

/* ====================== EARNINGS ORDERS LIST ====================== */
/**
 * GET /api/earnings/orders?type=day|week|month
 */
const getEarningsOrders = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const type = req.query.type || "day";
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

    const result = orders.map(order => {
      const earnings = calculateRiderEarnings(order.riderEarning);
      totalEarnings += earnings.total;

      return {
        orderId: order.orderId,
        ...earnings,
        completedAt: order.createdAt
      };
    });

    res.json({ type, totalEarnings, orders: result });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch earnings orders" });
  }
};

/* ====================== ORDER EARNING DETAIL ====================== */
/**
 * GET /api/earnings/orders/:orderId
 */
const getEarningOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      riderId: req.rider._id,
      orderId: req.params.orderId,
      orderStatus: "DELIVERED"
    }).lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found or not delivered"
      });
    }

    const earnings = calculateRiderEarnings(order.riderEarning);

    res.json({
      orderId: order.orderId,
      vendorShopName: order.vendorShopName,
      status: "COMPLETED",
      earnings,
      deliveryDetails: {
        distanceInKm: order?.tracking?.distanceInKm || 0,
        durationInMin: order?.tracking?.durationInMin || 0
      },
      deliveredAt: order.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order earning detail" });
  }
};

module.exports = {
  getDayEarnings,
  getWeekEarnings,
  getMonthEarnings,
  getEarningsSummary,
  getWallet,
  getEarningsOrders,
  getEarningOrderDetail
};
