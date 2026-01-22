const Incentive = require("../models/IncentiveSchema");
const RiderDailyStats = require("../models/RiderDailyStatsSchema");

exports.getWeeklyIncentiveForRider = async (req, res) => {
  try {
    const riderId = req.rider._id; // from  middleware
    // console.log("Rider ID:", riderId);
    // 1. Get active weekly incentive
const incentive = await Incentive.findOne({
  incentiveType: "WEEKLY_TARGET",
  status: "ACTIVE"
}).sort({ createdAt: -1 });
    console.log("Incentive found:", incentive);
    if (!incentive) {
      return res.status(200).json({
        success: true,
        message: "No weekly incentive available",
        data: null
      });
    }

    // 2. Calculate current week range
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // 3. Fetch rider daily stats for the week
    const stats = await RiderDailyStats.find({
      riderId,
      date: { $gte: startOfWeek, $lte: endOfWeek }
    });

    // 4. Calculate progress
    const minOrders = incentive.weeklyRules.minOrdersPerDay;

    let eligibleDays = 0;
    let totalOrders = 0;

    stats.forEach(day => {
      totalOrders += day.ordersCompleted;
      if (day.ordersCompleted >= minOrders) {
        eligibleDays++;
      }
    });

    const totalDaysRequired = incentive.weeklyRules.totalDaysInWeek;

    const isEligible = incentive.weeklyRules.allowPartialDays
      ? eligibleDays >= 1
      : eligibleDays >= totalDaysRequired;

    // 5. Final response for UI
    res.status(200).json({
      success: true,
      data: {
        incentiveId: incentive._id,
        title: incentive.incentiveType,
        description: incentive.description,

        weeklyRules: incentive.weeklyRules,
        maxRewardPerWeek: incentive.maxRewardPerWeek,

        progress: {
          eligibleDays,
          totalDaysRequired,
          totalOrders,
          isEligible
        }
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
