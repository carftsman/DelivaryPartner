// controllers/riderEarningsController.js
const RiderDailyEarnings = require("../models/RiderDailyEarnings");
const RiderOrderEarnings = require("../models/RiderOrderEarnings");
const Order = require("../models/OrderSchema");
const { getISOWeekRange , getCurrentISOWeek} = require("../helpers/getWeekNumber");
//1 Today / Week / Month cards
exports.getEarningsSummary = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const today = new Date();
    today.setHours(0,0,0,0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayData] = await RiderDailyEarnings.find({
      riderId,
      date: today
    });

    const weekAgg = await RiderDailyEarnings.aggregate([
      { $match: { riderId, date: { $gte: weekStart } } },
      { $group: {
          _id: null,
          total: { $sum: "$totalEarnings" }
      }}
    ]);

    const monthAgg = await RiderDailyEarnings.aggregate([
      { $match: { riderId, date: { $gte: monthStart } } },
      { $group: {
          _id: null,
          base: { $sum: "$baseEarnings" },
          incentives: { $sum: "$incentiveEarnings" },
          tips: { $sum: "$tips" },
          total: { $sum: "$totalEarnings" }
      }}
    ]);

    res.json({
      today: {
        orders: todayData?.ordersCount || 0,
        baseEarnings: todayData?.baseEarnings || 0,
        incentives: todayData?.incentiveEarnings || 0,
        tips: todayData?.tips || 0,
        total: todayData?.totalEarnings || 0
      },
      week: {
        total: weekAgg[0]?.total || 0
      },
      month: {
        baseEarnings: monthAgg[0]?.base || 0,
        incentives: monthAgg[0]?.incentives || 0,
        tips: monthAgg[0]?.tips || 0,
        total: monthAgg[0]?.total || 0
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2 Bar chart (Mon–Sun)
exports.getWeeklyChart = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0,0,0,0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const data = await RiderDailyEarnings.find({
      riderId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    const response = days.map((day, i) => {
      const d = data.find(x => new Date(x.date).getDay() === i);
      return {
        day,
        amount: d?.totalEarnings || 0,
        orders: d?.ordersCount || 0
      };
    });

    res.json({ week: response });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};


// 3 Daily earnings list

// exports.getDailyEarnings = async (req, res) => {
//     // console.log("hited daily earnings controller");
//     // console.log("Request query:", req.query); // Debugging line
//     // console.log("Rider ID:", req.rider._id); // Debugging line
//   try {
//     const riderId = req.rider._id;
//     const date = new Date(req.query.date);
//     date.setHours(0,0,0,0);

//     const daily = await RiderDailyEarnings.findOne({ riderId, date });
//     const orders = await RiderOrderEarnings.find({
//       riderId,
//       completedAt: {
//         $gte: date,
//         $lte: new Date(date.getTime() + 86400000)
//       }
//     }).sort({ completedAt: -1 });

//     res.json({
//       date,
//       totalEarnings: daily?.totalEarnings || 0,
//       items: orders.map(o => ({
//         type: "DELIVERY",
//         orderId: o.orderId,
//         amount: o.earnings.totalAmount,
//         time: o.completedAt
//       }))
//     });

//   } catch (err) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getDailyEarnings = async (req, res) => {
  try {
    const riderId = req.rider._id;

    let year, month, day;

    // -----------------------------
    //SAFE DATE PARSING (LOCAL)
    // -----------------------------
    if (req.query.date) {
      // Expecting YYYY-MM-DD
      const parts = req.query.date.split("-").map(Number);

      if (parts.length !== 3) {
        return res.status(400).json({
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }

      [year, month, day] = parts;

      if (!year || !month || !day) {
        return res.status(400).json({
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    } else {
      const today = new Date();
      year = today.getFullYear();
      month = today.getMonth() + 1;
      day = today.getDate();
    }

    // -----------------------------
    //CREATE LOCAL DAY RANGE
    // -----------------------------
    const baseDate = new Date(year, month - 1, day);

    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    // -----------------------------
    //FETCH DAILY AGGREGATE
    // -----------------------------
    const daily = await RiderDailyEarnings.findOne({
      riderId,
      date: startOfDay
    });

    // -----------------------------
    // FETCH ORDERS FOR THE DAY
    // -----------------------------
    const orders = await RiderOrderEarnings.find({
      riderId,
      completedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ completedAt: -1 });

    // -----------------------------
    // FORMAT DATE FOR UI
    // -----------------------------
    const responseDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // -----------------------------
    // RESPONSE
    // -----------------------------
    res.json({
      date: responseDate,
      totalEarnings: daily?.totalEarnings || 0,
      items: orders.map(o => ({
        type: "DELIVERY",
        orderId: o.orderId,
        amount: o.earnings?.totalAmount || 0,
        time: o.completedAt
      }))
    });

  } catch (err) {
    console.error("Daily earnings error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// 4

// exports.getDeliveryEarnings = async (req, res) => {
//   try {
//     const riderId = req.rider._id;
//     const { orderId } = req.params;

//     const earning = await Order.findOne({ riderId, orderId });
//     // const dummy = await Order.findOne({ riderId, orderId });
//     console.log("dummy data:", earning); // Debugging line

//     if (!earning) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     res.json({
//     //   orderId,
//       store: earning?.pickupAddress?.name || "Unknown Store",
//       totalEarnings: earning?.earnings?.totalAmount || 0,
//       breakup: earning?.earnings || {},
//       status: "COMPLETED",
//       time: earning?.completedAt || null
//     });

//   } catch (err) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getDeliveryEarnings = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ riderId, orderId });

    console.log("Order data:", order);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("Rider Earning data:", order.riderEarning.total);
res.json({
  orderId: order.orderId,
  store: order.vendorShopName,
  totalEarnings:
    order.riderEarning?.total ??
    order.riderEarning?.totalEarning ??
    10,

  breakup: {
    baseFare: order.riderEarning?.baseFare || 0,
    distanceFare: order.riderEarning?.distanceFare || 0,
    surgePay: order.riderEarning?.surgePay || 0,
    incentive: order.riderEarning?.incentive || 0,
    tips: order.riderEarning?.tips || 0
  },

  status: order.orderStatus,
  time: order.updatedAt
});


  } catch (err) {
    console.error("Delivery earnings error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// 5
// exports.getWeeklyEarnings = async (req, res) => {
//   try {
//     const riderId = req.rider._id;

//     const start = new Date();
//     start.setDate(start.getDate() - start.getDay());
//     start.setHours(0,0,0,0);

//     const data = await RiderDailyEarnings.find({
//       riderId,
//       date: { $gte: start }
//     }).sort({ date: -1 });
//     console.log("Weekly earnings data:", data); // Debugging line
//     res.json({
//       weekRange: "Current Week",
//       total: data.reduce((s, d) => s + d.totalEarnings, 0),
//       days: data.map(d => ({
//         day: d.date.toDateString(),
//         orders: d.ordersCount,
//         amount: d.totalEarnings
//       }))
//     });

//   } catch (err) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getWeeklyEarnings = async (req, res) => {
  try {
    const riderId = req.rider._id;
    let { week, year } = req.query;

    // ---- DEFAULT CURRENT ISO WEEK ----
    if (!week || !year) {
      const current = getCurrentISOWeek();
      week = current.week;
      year = current.year;
    }

    const { start, end } = getISOWeekRange(Number(week), Number(year));

    // ---- FETCH ORDERS FOR THE WEEK ----
    const orders = await Order.find({
      riderId,
      orderStatus: "DELIVERED",
      updatedAt: { $gte: start, $lte: end }
    }).sort({ updatedAt: 1 });

    // ---- GROUP ORDERS BY DAY ----
    const ordersByDay = {};

    orders.forEach(order => {
      const dayKey = new Date(order.updatedAt).toDateString();

      if (!ordersByDay[dayKey]) {
        ordersByDay[dayKey] = [];
      }

      ordersByDay[dayKey].push({
        orderId: order.orderId,
        amount:
          order.riderEarning?.total ??
          order.riderEarning?.totalEarning ??
          0,
        time: order.updatedAt
      });
    });

    // ---- BUILD 7 DAYS RESPONSE (MON → SUN) ----
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      const dayKey = day.toDateString();
      const dayOrders = ordersByDay[dayKey] || [];

      const totalAmount = dayOrders.reduce(
        (sum, o) => sum + o.amount,
        0
      );

      days.push({
        day: day.toLocaleDateString("en-IN", { weekday: "short" }),
        date: day.toISOString().split("T")[0],
        ordersCount: dayOrders.length,
        amount: totalAmount,
        orders: dayOrders
      });
    }

    res.json({
      week: Number(week),
      year: Number(year),
      weekRange: `${start.toDateString()} - ${end.toDateString()}`,
      total: days.reduce((s, d) => s + d.amount, 0),
      days
    });

  } catch (err) {
    console.error("Weekly earnings error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};




// 6

exports.getEarningsHistory = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const {
      from,
      to,
      page = 1,
      limit = 10
    } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: "from and to dates are required (YYYY-MM-DD)"
      });
    }

    const startDate = new Date(from);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      RiderDailyEarnings.find({
        riderId,
        date: { $gte: startDate, $lte: endDate }
      })
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),

      RiderDailyEarnings.countDocuments({
        riderId,
        date: { $gte: startDate, $lte: endDate }
      })
    ]);

    res.json({
      page: Number(page),
      limit: Number(limit),
      totalRecords: total,
      data: records.map(d => ({
        date: d.date,
        orders: d.ordersCount,
        totalEarnings: d.totalEarnings,
        payoutStatus: d.payoutStatus
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


