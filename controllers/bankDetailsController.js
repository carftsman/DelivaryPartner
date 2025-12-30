const Rider = require("../models/RiderModel");

/**
 * Add or Update Bank Details
 */
exports.addOrUpdateBankDetails = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { bankName, accountHolderName, accountNumber, ifscCode } = req.body;

    if (!bankName || !accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: "All bank details are required",
      });
    }

    await Rider.findByIdAndUpdate(riderId, {
      $set: {
        bankDetails: {
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode,
          addedBankAccount: true,
        },
         ifscVerificationStatus: "PENDING",
    bankVerificationStatus: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Bank details saved successfully",
    });
  } catch (error) {
    console.error("Add/Update Bank Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save bank details",
    });
  }
};

/**
 * Get Bank Details
 */
exports.getBankDetails = async (req, res) => {
  try {
    const rider = await Rider.findById(req.rider._id).select("bankDetails ifscVerificationStatus bankVerificationStatus");

    return res.status(200).json({
      success: true,
      data: {
    ...rider?.bankDetails?.toObject(),
    ifscVerificationStatus: rider?.ifscVerificationStatus || "PENDING",
    bankVerificationStatus: rider?.bankVerificationStatus || "PENDING",
  },
});
  } catch (error) {
    console.error("Get Bank Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bank details",
    });
  }
};

/**
 * Bank Details Status (Banner Check)
 */
exports.getBankDetailsStatus = async (req, res) => {
  try {
    const rider = await Rider.findById(req.rider._id).select(
      "bankDetails.addedBankAccount ifscVerificationStatus bankVerificationStatus"
    );

    return res.status(200).json({
  success: true,
  addedBankAccount: rider?.bankDetails?.addedBankAccount || false,
  ifscVerificationStatus: rider?.ifscVerificationStatus || "PENDING",
  bankVerificationStatus: rider?.bankVerificationStatus || "PENDING",
});
  } catch (error) {
    console.error("Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bank status",
    });
  }
};

/**
 * Delete Bank Details
 */
exports.deleteBankDetails = async (req, res) => {
  try {
    await Rider.findByIdAndUpdate(req.rider._id, {
      $set: {
        bankDetails: { addedBankAccount: false },
        ifscVerificationStatus: "PENDING",
        bankVerificationStatus: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Bank details removed successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete bank details",
    });
  }
};
