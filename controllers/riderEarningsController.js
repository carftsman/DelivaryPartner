// controllers/riderEarningsController.js
const RiderDailyEarnings = require("../models/RiderDailyEarnings");
const RiderOrderEarnings = require("../models/RiderOrderEarnings");

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

exports.getDailyEarnings = async (req, res) => {
    console.log("hited daily earnings controller");
    console.log("Request query:", req.query); // Debugging line
    console.log("Rider ID:", req.rider._id); // Debugging line
  try {
    const riderId = req.rider._id;
    const date = new Date(req.query.date);
    date.setHours(0,0,0,0);

    const daily = await RiderDailyEarnings.findOne({ riderId, date });
    const orders = await RiderOrderEarnings.find({
      riderId,
      completedAt: {
        $gte: date,
        $lte: new Date(date.getTime() + 86400000)
      }
    }).sort({ completedAt: -1 });

    res.json({
      date,
      totalEarnings: daily?.totalEarnings || 0,
      items: orders.map(o => ({
        type: "DELIVERY",
        orderId: o.orderId,
        amount: o.earnings.totalAmount,
        time: o.completedAt
      }))
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4

exports.getDeliveryEarnings = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { orderId } = req.params;

    const earning = await RiderOrderEarnings.findOne({ riderId, orderId });

    if (!earning) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({
      orderId,
      store: earning.storeName,
      totalEarnings: earning.earnings.totalAmount,
      breakup: earning.earnings,
      status: "COMPLETED",
      time: earning.completedAt
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 5
exports.getWeeklyEarnings = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0,0,0,0);

    const data = await RiderDailyEarnings.find({
      riderId,
      date: { $gte: start }
    }).sort({ date: -1 });
    console.log("Weekly earnings data:", data); // Debugging line
    res.json({
      weekRange: "Current Week",
      total: data.reduce((s, d) => s + d.totalEarnings, 0),
      days: data.map(d => ({
        day: d.date.toDateString(),
        orders: d.ordersCount,
        amount: d.totalEarnings
      }))
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

