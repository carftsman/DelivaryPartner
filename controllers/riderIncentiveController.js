const Incentive = require("../models/IncentiveSchema");
const RiderDailyStats = require("../models/RiderDailyStatsSchema");

const Order = require("../models/OrderSchema");

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



// ========================================
// RIDER DAILY INCENTIVE API
// ========================================

exports.getDailyIncentive = async (req, res) => {
  try {

    // -----------------------------
    // Auth Safety
    // -----------------------------

    const riderId = req.rider?._id;

    if (!riderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized rider"
      });
    }

    // -----------------------------
    // Today's Date Filter (MATCH ORDER HISTORY)
    // -----------------------------

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // -----------------------------
    // Fetch Today's Delivered Orders
    // -----------------------------

    const orders = await Order.find({
      riderId,
      orderStatus: "DELIVERED",
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalOrders = orders.length;

    // -----------------------------
    // Calculate Earnings + Slots
    // -----------------------------

    let orderEarnings = 0;
    let peakOrders = 0;
    let normalOrders = 0;

    orders.forEach(order => {

      // Delivery earning only (not full order amount)
      orderEarnings += Number(order.pricing?.deliveryFee || 0);

      // Slot safety
      if (order.slotType?.toUpperCase() === "PEAK") peakOrders++;
      if (order.slotType?.toUpperCase() === "NORMAL") normalOrders++;

    });

    // -----------------------------
    // Fetch Incentive Config
    // -----------------------------

    const incentive = await Incentive.findOne({
      incentiveType: "DAILY_TARGET",
      status: "ACTIVE"
    });

    let incentiveAmount = 0;

    // -----------------------------
    // Incentive Eligibility (Internal Logic)
    // -----------------------------

    if (incentive) {

      const peakSlotEligible =
        peakOrders >= incentive.slotRules.minPeakSlots;

      const normalSlotEligible =
        normalOrders >= incentive.slotRules.minNormalSlots;

      if (
        peakSlotEligible &&
        normalSlotEligible &&
        incentive.slabs?.normal?.length
      ) {

        incentive.slabs.normal.forEach(slab => {

          if (
            totalOrders >= slab.minOrders &&
            totalOrders <= slab.maxOrders
          ) {
            incentiveAmount = slab.rewardAmount;
          }

        });

        // Max reward cap protection
        if (
          incentive.maxRewardPerDay &&
          incentiveAmount > incentive.maxRewardPerDay
        ) {
          incentiveAmount = incentive.maxRewardPerDay;
        }
      }
    }

    // -----------------------------
    // Final Earnings
    // -----------------------------

    const totalEarnings = orderEarnings + incentiveAmount;

    // -----------------------------
    // RESPONSE (NO ELIGIBLE FLAG)
    // -----------------------------

    return res.status(200).json({
      success: true,
      todaySummary: {
        totalOrders,
        peakOrders,
        normalOrders,
        orderEarnings,
        incentiveEarnings: incentiveAmount,
        totalEarnings
      }
    });

  } catch (error) {

    console.error("Daily Incentive Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate earnings"
    });
  }
};
