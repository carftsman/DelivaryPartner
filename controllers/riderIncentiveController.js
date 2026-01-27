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

const mongoose = require("mongoose");

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

    const riderObjectId = new mongoose.Types.ObjectId(riderId);

    // -----------------------------
    // TODAY RANGE (SERVER SAFE)
    // -----------------------------

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // -----------------------------
    // FIND DELIVERED ORDERS (MULTI FIELD SUPPORT)
    // -----------------------------

    const orders = await Order.find({
      $and: [
        {
          $or: [
            { rider: riderObjectId },
            { riderId: riderObjectId },
            { assignedRider: riderObjectId },
            { deliveryPartner: riderObjectId }
          ]
        },
        {
          orderStatus: { $regex: /^DELIVERED$/i } // case safe
        },
        {
          $or: [
            { deliveredAt: { $gte: startOfDay, $lte: endOfDay } },
            { updatedAt: { $gte: startOfDay, $lte: endOfDay } } // fallback
          ]
        }
      ]
    });

    // -----------------------------
    // ORDER STATS
    // -----------------------------

    let totalOrders = orders.length;
    let peakOrders = 0;
    let normalOrders = 0;
    let orderEarnings = 0;

    orders.forEach(order => {

      orderEarnings += Number(order.pricing?.deliveryFee || 0);

      if (order.slotType?.toUpperCase() === "PEAK") peakOrders++;
      if (order.slotType?.toUpperCase() === "NORMAL") normalOrders++;

    });

    // -----------------------------
    // FETCH INCENTIVE CONFIG
    // -----------------------------

    const incentive = await Incentive.findOne({
      incentiveType: "DAILY_TARGET",
      status: "ACTIVE"
    });

    let incentiveAmount = 0;

    // -----------------------------
    // INCENTIVE LOGIC
    // -----------------------------

    if (incentive && incentive.slabs?.length) {

      const slabBlock = incentive.slabs[0];

      const peakEligible =
        incentive.applicableSlots?.peak
          ? peakOrders >= incentive.slotRules.minPeakSlots
          : true;

      const normalEligible =
        incentive.applicableSlots?.normal
          ? normalOrders >= incentive.slotRules.minNormalSlots
          : true;

      if (peakEligible && normalEligible) {

        // PEAK slabs
        if (slabBlock.peak?.length) {
          slabBlock.peak.forEach(slab => {
            if (
              totalOrders >= slab.minOrders &&
              totalOrders <= slab.maxOrders
            ) {
              incentiveAmount = Math.max(incentiveAmount, slab.rewardAmount);
            }
          });
        }

        // NORMAL slabs
        if (slabBlock.normal?.length) {
          slabBlock.normal.forEach(slab => {
            if (
              totalOrders >= slab.minOrders &&
              totalOrders <= slab.maxOrders
            ) {
              incentiveAmount = Math.max(incentiveAmount, slab.rewardAmount);
            }
          });
        }

        // MAX CAP
        if (
          incentive.maxRewardPerDay &&
          incentiveAmount > incentive.maxRewardPerDay
        ) {
          incentiveAmount = incentive.maxRewardPerDay;
        }
      }
    }

    // -----------------------------
    // FINAL TOTAL
    // -----------------------------

    const totalEarnings = orderEarnings + incentiveAmount;

    // -----------------------------
    // RESPONSE
    // -----------------------------

// -----------------------------
// FINAL RESPONSE FORMAT
// -----------------------------

const eligible = incentiveAmount > 0;

return res.status(200).json({
  success: true,
  eligible,
  message: eligible
    ? "Daily incentive achieved"
    : "Daily incentive not achieved",
  data: {
    riderId: riderId.toString(),
    incentiveId: incentive?._id || null,
    title: incentive?.title || null,
    ordersCompleted: totalOrders,
    rewardAmount: incentiveAmount,
    payoutTiming: incentive?.payoutTiming || null
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
