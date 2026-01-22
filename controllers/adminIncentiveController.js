
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




