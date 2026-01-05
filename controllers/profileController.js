

const Rider = require("../models/RiderModel");
const Order = require("../models/OrderSchema");
const mongoose=require('mongoose')
const { extractTextFromImage } = require("../utils/ocr");
const { extractPAN, extractDL } = require("../utils/kycParser");
const { uploadToAzure } = require("../utils/azureUpload"); // path adjust


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
    const updateData = {};

    /* ---------------- DEBUG (KEEP TEMPORARILY) ---------------- */
    // console.log("REQ BODY:", req.body);
    // console.log("REQ FILE:", req.file);

    /* ---------------- HANDLE TEXT FIELDS (SINGLE / MULTIPLE) ---------------- */
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== "") {
        updateData[key] = req.body[key];
      }
    });

    /* ---------------- HANDLE SELFIE (AZURE) ---------------- */
    if (req.file) {
      const selfieUrl = await uploadToAzure(req.file, "selfies");
      updateData.selfie = selfieUrl;
    }

    /* ---------------- VALIDATION ---------------- */
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update"
      });
    }

    /* ---------------- UPDATE ---------------- */
    const updatedRider = await Rider.findByIdAndUpdate(
      riderId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedRider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updateData
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
    const riderId = req.rider?._id;
    if (!riderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider not found" });
    }

    rider.kyc = rider.kyc || {};

    const updatedDocs = [];

    /* ================= PAN ================= */
    if (req.files?.panImage?.[0]) {
      const panImageUrl = await uploadToAzure(req.files.panImage[0], "pan");

      const text = await extractTextFromImage(panImageUrl);
      const panNumber = extractPAN(text);

      if (!panNumber) {
        return res.status(400).json({
          success: false,
          message: "Invalid PAN image"
        });
      }

      rider.kyc.pan = {
        number: panNumber,
        image: panImageUrl,
        status: "approved",
        isVerified: true,
        updatedAt: new Date()
      };

      updatedDocs.push("PAN");
    }

    /* ================= DRIVING LICENSE ================= */
    if (req.files?.dlFrontImage?.[0]) {
      const frontUrl = await uploadToAzure(req.files.dlFrontImage[0], "dl-front");
      const backUrl = req.files?.dlBackImage?.[0]
        ? await uploadToAzure(req.files.dlBackImage[0], "dl-back")
        : rider.kyc.drivingLicense?.backImage;

      const text = await extractTextFromImage(frontUrl);
      const dlNumber = extractDL(text);

      if (!dlNumber) {
        return res.status(400).json({
          success: false,
          message: "Invalid Driving License image"
        });
      }

      rider.kyc.drivingLicense = {
        number: dlNumber,
        frontImage: frontUrl,
        backImage: backUrl,
        status: "approved",
        isVerified: true,
        updatedAt: new Date()
      };

      updatedDocs.push("Driving License");
    }

    /* ================= NO FILE UPLOADED ================= */
    if (updatedDocs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded"
      });
    }

    await rider.save();

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      message: `${updatedDocs.join(" & ")} updated successfully`,
      data: {
        ...(rider.kyc.pan && {
          pan: {
            number: rider.kyc.pan.number,
            image: rider.kyc.pan.image,
            status: rider.kyc.pan.status
          }
        }),
        ...(rider.kyc.drivingLicense && {
          drivingLicense: {
            number: rider.kyc.drivingLicense.number,
            frontImage: rider.kyc.drivingLicense.frontImage,
            backImage: rider.kyc.drivingLicense.backImage,
            status: rider.kyc.drivingLicense.status
          }
        })
      }
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
    const riderId = req.rider?._id;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: "Rider ID missing"
      });
    }

    const { filter = "all" } = req.query;
    let dateFilter = {};

    // ---------- DATE FILTERS ----------
    if (filter === "daily") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      dateFilter.createdAt = { $gte: start, $lte: end };
    }

    if (filter === "weekly") {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      dateFilter.createdAt = { $gte: start, $lte: new Date() };
    }

    if (filter === "monthly") {
      const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

      dateFilter.createdAt = { $gte: start, $lte: end };
    }

    // ---------- FETCH ORDERS ----------
    const orders = await Order.find({
      riderId,
      orderStatus: "DELIVERED",
      ...dateFilter
    }).sort({ createdAt: -1 });

    // ---------- TOTALS ----------
    const totalOrders = orders.length;

    const totalEarnings = orders.reduce(
      (sum, o) => sum + (o.pricing?.totalAmount || 0),
      0
    );

    const totalDistance = orders.reduce(
      (sum, o) => sum + (o.tracking?.distanceInKm || 0),
      0
    );

    const ratings = orders
      .map(o => o.rating)
      .filter(r => typeof r === "number");

    const avgRating =
      ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;

    // ---------- RESPONSE ----------
    const data = orders.map(order => ({
      orderId: order.orderId,

      items: order.items?.map(item => ({
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })) || [],

      pricing: {
        itemTotal: order.pricing?.itemTotal || 0,
        deliveryFee: order.pricing?.deliveryFee || 0,
        tax: order.pricing?.tax || 0,
        platformCommission: order.pricing?.platformCommission || 0,
        totalAmount: order.pricing?.totalAmount || 0
      },

      customerTip: order.payment?.tip || 0,

      distanceTravelled: order.tracking?.distanceInKm || 0,

      durationInMin: order.tracking?.durationInMin || 0,

      rating: order.rating || null,

deliveredAddress: order.deliveryAddress?.addressLine || ""
    }));

    return res.status(200).json({
      success: true,
      filter,
      totalOrders,
      totalEarnings,
      totalDistance,
      avgRating,
      data
    });

  } catch (err) {
    console.error("Order History Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
