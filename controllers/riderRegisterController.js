const Rider = require("../models/RiderModel");
const jwt = require("jsonwebtoken");
const path = require("path");
const { sendSMS } = require("../utils/twilio");
const citiesData = require("../helpers/data.json");
const { uploadToAzure } = require("../utils/azureUpload");


// ============================================================
// SEND OTP
// ============================================================
exports.sendOtp = async (req, res) => {
  try {
    let { phone } = req.body;

    if (!phone)
      return res.status(400).json({ success: false, message: "Phone number required" });

    // Normalize phone format
    if (!phone.startsWith("+") && phone.length === 10) {
      phone = `+91${phone}`;
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 min

    // Find or create rider
    let rider = await Rider.findOne({ "phone.number": phone.replace("+91", "") });

    if (!rider) {
      rider = new Rider({
        phone: {
          number: phone.replace("+91", ""),
          countryCode: "+91",
        },
        onboardingStage: "PHONE_VERIFICATION",
      });
    }

    // Save OTP to DB
    rider.otp = {
      code: otp,
      expiresAt,
    };
    await rider.save();

    // DEV/PROD SMS handling
    const smsResponse = await sendSMS(phone, otp);

    res.json({
      success: true,
      message: smsResponse.dev ? "OTP (DEV MODE)" : "OTP sent successfully",
      phone,
      ...(smsResponse.dev && { otp }), // show OTP only in dev mode
    });
  } catch (error) {
    console.error("Send OTP ERROR →", error);
    res.status(500).json({ success: false, message: "Server error while sending OTP" });
  }
};

// ============================================================
// VERIFY OTP
// ============================================================
exports.verifyOtp = async (req, res) => {
  try {
    let { phone, otp } = req.body;

    if (!phone || !otp)
      return res.status(400).json({ success: false, message: "Phone & OTP required" });

    // Normalize phone format
    let formattedPhone = phone;
    if (!phone.startsWith("+") && phone.length === 10) {
      formattedPhone = `+91${phone}`;
    }

    // Find rider
    const rider = await Rider.findOne({
      "phone.number": formattedPhone.replace("+91", ""),
    });

    if (!rider)
      return res.status(404).json({ success: false, message: "Rider not found" });

    // Check if OTP exists
    if (!rider.otp || !rider.otp.code)
      return res.status(400).json({ success: false, message: "OTP not generated" });

    // Check expiry
    if (new Date() > rider.otp.expiresAt)
      return res.status(401).json({ success: false, message: "OTP expired" });

    // Check OTP match
    if (otp !== rider.otp.code)
      return res.status(401).json({ success: false, message: "Incorrect OTP" });

    // Update phone status
    rider.phone.isVerified = true;
    rider.lastOtpVerifiedAt = new Date();

    // Update onboarding
    rider.onboardingProgress.phoneVerified = true;

    if (rider.onboardingStage === "PHONE_VERIFICATION") {
      rider.onboardingStage = "APP_PERMISSIONS"; // next onboarding step
    }

    // Remove OTP from DB
    rider.otp = undefined;

    await rider.save();

    // Generate JWT
    const token = jwt.sign(
      {
        riderId: rider._id,
        phone: rider.phone.number,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "OTP Verified",
      isNewUser: rider.isFullyRegistered === false,
      nextStage: rider.onboardingStage,
      token,
    });
  } catch (error) {
    console.error("Verify OTP ERROR →", error);
    res.status(500).json({ success: false, message: "Server error verifying OTP" });
  }
};

// ===============================
// SAVE RIDER LOCATION
// ===============================
exports.updateLocation = async (req, res) => {
  try {
    const riderId = req.rider._id; // JWT middleware will set this
    const { city, area } = req.body;

    if (!city || !area)
      return res.status(400).json({ success: false, message: "City & area required" });

    const foundCity = citiesData.find(
      (item) => item.city.toLowerCase() === city.toLowerCase()
    );

    if (!foundCity)
      return res.status(404).json({ success: false, message: "Invalid city" });

    if (!foundCity.areas.includes(area))
      return res.status(404).json({ success: false, message: "Invalid area" });

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      {
        location: { city, area },
        "onboardingProgress.citySelected": true,
        onboardingStage: "SELECT_VEHICLE",
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Location updated",
      location: rider.location,
      nextStage: rider.onboardingStage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




exports.checkStatus = async (req, res) => {
  res.send("Check rider status logic here");
};

// ------------------ PERSONAL INFO -------------------
exports.savePersonalInfo = async (req, res) => {
  try {
    const riderId = req.rider?._id; // middleware attaches rider

    if (!riderId) {
      return res.status(401).json({ message: "Unauthorized rider" });
    }

    const {
      fullName,
      dob,
      gender,
      primaryPhone,
      secondaryPhone,
      email,
    } = req.body;

    // ---------- Basic required fields ----------
    if (!fullName || !primaryPhone) {
      return res.status(400).json({
        message: "fullName and primaryPhone are required",
      });
    }

    // ---------- Fetch rider ----------
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // ---------- Respect registration flow ----------
    if (!rider.onboardingProgress.phoneVerified) {
      return res.status(400).json({
        message: "Phone not verified. Complete OTP verification first.",
      });
    }

    // ---------- Update personal info ----------
    rider.personalInfo = {
      fullName,
      dob,
      gender,           // schema will auto-validate allowed values
      primaryPhone,
      secondaryPhone,
      email,
    };

    // ---------- Update onboarding progress ----------
    rider.onboardingProgress.personalInfoSubmitted = true;

    // Move to next onboarding stage
    rider.onboardingStage = "SELFIE";

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Personal info saved successfully",
      data: {
        riderId: rider._id,
        personalInfo: rider.personalInfo,
        onboardingProgress: rider.onboardingProgress,
        onboardingStage: rider.onboardingStage,
      },
    });
  } catch (err) {
    console.error("Error saving personal info:", err);
    return res.status(500).json({
      success: false,
      message: "Error saving personal info",
      error: err.message,
    });
  }
};


// ------------------ VEHICLE -------------------
exports.updateVehicle = async (req, res) => {
  try {
    const riderId = req.rider?._id;
    const { type } = req.body;

    // Basic required validation
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type is required",
      });
    }

    // Fetch rider
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    // Enforce previous steps (optional but recommended)
    if (!rider.onboardingProgress.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone not verified. Complete OTP verification first.",
      });
    }

    if (!rider.onboardingProgress.citySelected) {
      return res.status(400).json({
        success: false,
        message: "Location must be selected before choosing vehicle.",
      });
    }

    // Update vehicle info (schema will auto-validate enum)
    rider.vehicleInfo = { type };

    // Update progress
    rider.onboardingProgress.vehicleSelected = true;

    // Move stage forward
    rider.onboardingStage = "PERSONAL_INFO";

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle selected successfully",
      data: {
        riderId: rider._id,
        vehicleInfo: rider.vehicleInfo,
        onboardingProgress: rider.onboardingProgress,
        onboardingStage: rider.onboardingStage,
      },
    });
  } catch (err) {
    console.error("Error selecting vehicle:", err);

    return res.status(500).json({
      success: false,
      message: "Error selecting vehicle",
      error: err.message,
    });
  }
};


// ------------------ SELFIE -------------------
exports.uploadSelfieController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Selfie file required" });
    }

    const url = await uploadToAzure(req.file, "selfies");

    await Rider.findByIdAndUpdate(req.rider._id, {
      selfie: { url, uploadedAt: new Date() },
      "onboardingProgress.selfieUploaded": true,
      onboardingStage: "AADHAAR"
    });

    res.json({ success: true, selfieUrl: url });
  } catch (err) {
    console.error("Selfie Upload Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ KYC -------------------
exports.uploadAadhar = async (req, res) => {
  res.send("Upload Aadhar logic");
};

exports.uploadPan = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "PAN image required" });

    const url = await uploadToAzure(req.file, "pan");

    await Rider.findByIdAndUpdate(req.rider._id, {
      "kyc.pan.image": url,
      "kyc.pan.status": "pending",
      "onboardingProgress.panUploaded": true,
      onboardingStage: "DL_UPLOAD"
    });

    res.json({ success: true, message: "PAN uploaded", url });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



exports.uploadDL = async (req, res) => {
  try {
    const { front, back } = req.files;

    if (!front || !back)
      return res.status(400).json({ message: "Front & back images required" });

    const frontUrl = await uploadToAzure(front[0], "dl");
    const backUrl = await uploadToAzure(back[0], "dl");

    await Rider.findByIdAndUpdate(req.rider._id, {
      "kyc.drivingLicense.frontImage": frontUrl,
      "kyc.drivingLicense.backImage": backUrl,
      "kyc.drivingLicense.status": "pending",
      "onboardingProgress.dlUploaded": true,
      onboardingStage: "KYC_SUBMITTED"
    });

    res.json({
      success: true,
      message: "DL uploaded",
      frontUrl,
      backUrl
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};




// ------------------ PROFILE -------------------
exports.getProfile = async (req, res) => {
  res.send("Get profile logic");
};
