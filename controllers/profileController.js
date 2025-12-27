

const Rider = require("../models/RiderModel");

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

      emergencyContact: {
        name: rider.emergencyContact?.name,
        phoneNumber: rider.emergencyContact?.phoneNumber
      },

      personalInfo: rider.personalInfo,

      location: {
        city: rider.location?.city,
        area: rider.location?.area,
        pincode: rider.location?.pincode     // ✅ added
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
