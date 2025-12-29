

const Rider = require("../models/RiderModel");
const Order = require("../models/OrderSchema");
const mongoose=require('mongoose')

exports.getProfile = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const rider = await Rider.findById(riderId).lean();

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    const data = {
      _id: rider._id,

      driverId: rider.driverId,
      email: rider.email,

      phone: {
        countryCode: rider.phone?.countryCode,
        number: rider.phone?.number
      },

      // emergencyContact: {
      //   name: rider.emergencyContact?.name,
      //   phoneNumber: rider.emergencyContact?.phoneNumber
      // },

      personalInfo: rider.personalInfo,

            location: {
        streetAddress: rider.location?.streetAddress,
        area: rider.location?.area,
        city: rider.location?.city,
        state: rider.location?.state,
        pincode: rider.location?.pincode
      },


      // vehicleInfo: rider.vehicleInfo,
      selfie: rider.selfie,

      onboardingStage: rider.onboardingStage,
      lastOtpVerifiedAt: rider.lastOtpVerifiedAt
    };

    // 🔥 Remove empty / undefined objects
    Object.keys(data).forEach(key => {
      if (
        data[key] == null ||
        (typeof data[key] === "object" &&
          Object.keys(data[key]).length === 0)
      ) {
        delete data[key];
      }
    });

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data
    });

  } catch (err) {
    console.error("Get Clean Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
exports.getAllDocuments = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const rider = await Rider.findById(riderId).select("kyc");

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully",
      data: rider.kyc || {}
    });

  } catch (err) {
    console.error("Get Documents Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const {
      phone,
      personalInfo,
      location,
      vehicleInfo,
      selfie
    } = req.body;

    const updateData = {};

    if (phone?.countryCode || phone?.number) {
      updateData.phone = {
        countryCode: phone?.countryCode,
        number: phone?.number
      };
    }

    if (personalInfo) updateData.personalInfo = personalInfo;
    if (location) updateData.location = location;
    if (vehicleInfo) updateData.vehicleInfo = vehicleInfo;
    if (selfie) updateData.selfie = selfie;

    const updatedRider = await Rider.findByIdAndUpdate(
      riderId,
      { $set: updateData },
      { new: true, lean: true }
    );

    if (!updatedRider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getBankDetails = async (req, res) => {
  try {
    const rider = await Rider.findById(req.rider._id).select("bankDetails");

    return res.status(200).json({
      success: true,
      data: rider?.bankDetails || {},
    });
  } catch (error) {
    console.error("Get Bank Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bank details",
    });
  }
};
exports.getKitAddress = async (req, res) => {
  try {
    const riderId = req.rider._id;
 
    const rider = await Rider.findById(
      riderId,
      "kitDeliveryAddress.name kitDeliveryAddress.completeAddress kitDeliveryAddress.pincode"
    );
 
    if (!rider || !rider.kitDeliveryAddress) {
      return res.status(404).json({
        message: "Kit delivery address not found",
      });
    }
 
    res.status(200).json({
      message: "Kit delivery address fetched successfully",
      data: rider.kitDeliveryAddress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch kit delivery address",
      error: error.message,
    });
  }
};
exports.getWalletDetails = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const rider = await Rider.findById(riderId)
      .select("wallet")
      .lean();

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wallet details fetched successfully",
      data: rider.wallet || {}
    });

  } catch (err) {
    console.error("Get Wallet Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
exports.updateDocuments = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const kycData = req.body.kyc; // expecting kyc object

    if (!kycData || typeof kycData !== "object") {
      return res.status(400).json({
        success: false,
        message: "KYC data is required"
      });
    }

    const rider = await Rider.findById(riderId);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    // ✅ Merge existing KYC with new updates
    rider.kyc = {
      ...rider.kyc,
      ...kycData
    };

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Documents updated successfully",
      data: rider.kyc
    });

  } catch (err) {
    console.error("Update Documents Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};






exports.getRiderOrderHistory = async (req, res) => {
  try {
    const riderId = req.rider?._id || req.user?._id;
    if (!riderId) {
      return res.status(400).json({ success: false, message: "Rider missing" });
    }

    const riderObjectId = mongoose.Types.ObjectId.isValid(riderId)
      ? new mongoose.Types.ObjectId(riderId)
      : null;

    const riderIdString = riderId.toString();
    const { filter = "all", status } = req.query;

    let dateFilter = {};
    const now = new Date();

    // ✅ UTC-safe filters
    if (filter === "daily") {
      const start = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(), 0, 0, 0
      ));
      const end = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(), 23, 59, 59, 999
      ));
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    if (filter === "weekly") {
      const end = new Date();
      const start = new Date();
      start.setUTCDate(end.getUTCDate() - 6);
      start.setUTCHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    if (filter === "monthly") {
      const start = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(), 1, 0, 0, 0
      ));
      const end = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1, 0, 23, 59, 59, 999
      ));
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    const query = {
      riderId: {
        $in: riderObjectId
          ? [riderObjectId, riderIdString]
          : [riderIdString]
      },
      ...dateFilter
    };

    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .select("orderId vendorShopName orderStatus pricing riderEarning payment createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      filter,
      totalOrders: orders.length,
      data: orders
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
