const RiderAssets = require("../models/RiderAsset");

/**
 * Raise Issue for selected assets
 * POST /api/rider/assets/issues
 */
exports.raiseAssetIssue = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { assets, issueType, description } = req.body;

    /**
     * assets = [
     *   { assetType: "T_SHIRT", assetName: "T-Shirt Size L" },
     *   { assetType: "BAG", assetName: "Delivery Bag - Large" }
     * ]
     */

    if (!assets || !assets.length) {
      return res.status(400).json({
        message: "Please select at least one asset",
      });
    }

    const riderAssets = await RiderAssets.findOne({ riderId });

    if (!riderAssets) {
      return res.status(404).json({
        message: "Assets not found for rider",
      });
    }

    const issuesToAdd = assets.map((item) => ({
      assetType: item.assetType,
      assetName: item.assetName,
      issueType: issueType || "OTHER",
      description,
    }));

    riderAssets.issues.push(...issuesToAdd);
    await riderAssets.save();

    return res.status(201).json({
      message: "Issue raised successfully",
      issuesRaised: issuesToAdd.length,
    });
  } catch (error) {
    console.error("Raise Asset Issue Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  };



};


  exports.getRiderAssets = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const data = await RiderAssets.findOne({ riderId }).lean();

    if (!data) {
      return res.json({
        totalAssets: 0,
        issues: 0,
        assets: [],
      });
    }

    const totalAssets = data.assets.length;
    const openIssues = data.issues.filter(
      (i) => i.status !== "RESOLVED"
    ).length;

    return res.json({
      totalAssets,
      issues: openIssues,
      assets: data.assets,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assets",
    });
  }
};
