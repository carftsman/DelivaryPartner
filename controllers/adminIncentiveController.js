
const Incentive = require("../models/IncentiveSchema");

exports.createWeeklyBonus = async (req, res) => {
  try {
    const { title, description, weeklyRules, maxRewardPerWeek } = req.body;

    if (!weeklyRules?.minOrdersPerDay || weeklyRules.minOrdersPerDay <= 0) {
      return res.status(400).json({
        message: "Minimum orders per day is required"
      });
    }

    if (!maxRewardPerWeek || maxRewardPerWeek <= 0) {
      return res.status(400).json({
        message: "Max weekly reward must be greater than 0"
      });
    }

    const incentive = await Incentive.create({
      title,
      description,
      incentiveType: "WEEKLY_TARGET",

      weeklyRules,
      maxRewardPerWeek,

      payoutTiming: "WEEKLY",
      status: "ACTIVE"
    });

    res.status(201).json({
      success: true,
      message: "Weekly bonus rule created successfully",
      data: incentive
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.adminIncentiveController = (req, res) => {
    res.send("Admin Incentive Endpoint")
}

// ========================================
// ADMIN UPSERT INCENTIVE
// ========================================

exports.upsertIncentive = async (req, res) => {
  try {

    const {
      title,
      description,
      incentiveType,
      slotRules,
      slabs,
      status
    } = req.body;

    // -----------------------------
    // Mandatory Validation
    // -----------------------------

    if (!title || !description || !incentiveType || !slotRules || !slabs || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory"
      });
    }

    // -----------------------------
    // Slot Rules Validation
    // -----------------------------

    if (
      slotRules.minPeakSlots === undefined ||
      slotRules.minNormalSlots === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "slotRules.minPeakSlots and slotRules.minNormalSlots are required"
      });
    }

    // -----------------------------
    // Slabs Validation
    // -----------------------------

    if (!slabs.peak || !slabs.normal) {
      return res.status(400).json({
        success: false,
        message: "Both peak and normal slabs are required"
      });
    }

    if (!Array.isArray(slabs.peak) || slabs.peak.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Peak slabs must be non-empty"
      });
    }

    if (!Array.isArray(slabs.normal) || slabs.normal.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Normal slabs must be non-empty"
      });
    }

    // -----------------------------
    // Validate Each Slab
    // -----------------------------

    const validateSlabs = (slabArray, type) => {
      for (const slab of slabArray) {

        if (
          slab.minOrders === undefined ||
          slab.maxOrders === undefined ||
          slab.rewardAmount === undefined
        ) {
          throw new Error(`${type} slab must contain minOrders, maxOrders, rewardAmount`);
        }

        if (slab.minOrders > slab.maxOrders) {
          throw new Error(`${type} slab minOrders cannot exceed maxOrders`);
        }
      }
    };

    try {
      validateSlabs(slabs.peak, "Peak");
      validateSlabs(slabs.normal, "Normal");
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // -----------------------------
    // AUTO ADD applicableSlots
    // -----------------------------

    const incentivePayload = {
      title,
      description,
      incentiveType,

      applicableSlots: {
        peak: true,
        normal: true
      },

      slotRules,
      slabs,
      status
    };

    // -----------------------------
    // CHECK EXISTING INCENTIVE
    // -----------------------------

    const existingIncentive = await Incentive.findOne({ incentiveType });

    // -----------------------------
    // SAME DAY UPDATE BLOCK
    // -----------------------------

    if (existingIncentive) {

      const lastUpdated = new Date(existingIncentive.updatedAt);
      const today = new Date();

      const isSameDay =
        lastUpdated.getDate() === today.getDate() &&
        lastUpdated.getMonth() === today.getMonth() &&
        lastUpdated.getFullYear() === today.getFullYear();

      if (isSameDay) {
        return res.status(403).json({
          success: false,
          message: "Incentive already updated today. You can update again tomorrow."
        });
      }
    }

    // -----------------------------
    // UPSERT OPERATION
    // -----------------------------

    let incentive;

    if (existingIncentive) {

      incentive = await Incentive.findOneAndUpdate(
        { incentiveType },
        incentivePayload,
        { new: true }
      );

      return res.status(200).json({
        success: true,
        action: "UPDATED",
        message: "Incentive updated successfully",
        data: incentive
      });

    } else {

      incentive = await Incentive.create(incentivePayload);

      return res.status(201).json({
        success: true,
        action: "CREATED",
        message: "Incentive created successfully",
        data: incentive
      });
    }

  } catch (error) {

    console.error("Admin Incentive Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save incentive"
    });
  }
};


exports.adminIncentiveController = async (req, res) => {
  try {

    /**
     * ===========================
     * GET PEAK SLOT INCENTIVE
     * ===========================
     */
    if (req.method === "GET") {
      const incentive = await Incentive.findOne({
        incentiveType: "PEAK_SLOT",
        status: "ACTIVE"
      }).lean();

      if (!incentive || !incentive.slabs || incentive.slabs.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No peak slot incentive found",
          data: null
        });
      }

      // ✅ CORRECT ACCESS
      const slabBlock = incentive.slabs[0];
      const peakSlabs = slabBlock.peak || [];

      const minPeak = incentive.slotRules?.minPeakSlots || 0;
      const minNormal = incentive.slotRules?.minNormalSlots || 0;
      const totalMinSlots = minPeak + minNormal;

      const maxOrders = peakSlabs.length
        ? Math.max(...peakSlabs.map(s => s.maxOrders))
        : null;

      const slotRule =
        totalMinSlots && maxOrders
          ? `${totalMinSlots} - ${maxOrders} hrs`
          : null;

      return res.status(200).json({
        success: true,
        message: "Peak slot incentive fetched successfully",
        data: {
          title: incentive.title,
          slotRule,
          slabs: peakSlabs.map(s => ({
            orders: s.minOrders,
            rewardAmount: s.rewardAmount
          })),
          payoutTiming: incentive.payoutTiming
        }
      });
    }

    /**
     * ===========================
     * POST PEAK SLOT INCENTIVE
     * ===========================
     */
    if (req.method === "POST") {
      const {
        title,
        description,
        minPeakSlots,
        minNormalSlots,
        slabs,
        status
      } = req.body;

      if (!slabs?.peak || slabs.peak.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Peak slabs are required"
        });
      }

      await Incentive.findOneAndUpdate(
        { incentiveType: "PEAK_SLOT" },
        {
          title,
          description,
          incentiveType: "PEAK_SLOT",
          applicableSlots: { peak: true, normal: true },
          slotRules: {
            minPeakSlots,
            minNormalSlots
          },
          slabs: [
            {
              peak: slabs.peak,
              normal: slabs.normal || []
            }
          ],
          payoutTiming: "POST_SLOT",
          status
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Peak slot incentive saved successfully"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error("Peak Incentive Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
