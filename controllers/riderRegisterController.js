const Rider = require("../models/RiderModel");
const jwt = require("jsonwebtoken");
const path = require("path");
const { sendSMS } = require("../utils/twilio");
const citiesData = require("../helpers/data.json");


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
    // riderId from your auth/middleware
    // adjust depending on how you set it (req.rider, req.user, etc.)
    const riderId = req.rider?._id

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

    // ---------- Basic validation ----------
    if (!fullName || !primaryPhone) {
      return res.status(400).json({
        message: "fullName and primaryPhone are required",
      });
    }

    const allowedGenders = ["male", "female", "other"];
    if (gender && !allowedGenders.includes(gender)) {
      return res.status(400).json({
        message: `gender must be one of: ${allowedGenders.join(", ")}`,
      });
    }

    // ---------- Fetch rider ----------
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Optional guards to respect your flow
    if (!rider.onboardingProgress.phoneVerified) {
      return res
        .status(400)
        .json({ message: "Phone number is not verified yet" });
    }

    // if (!rider.onboardingProgress.appPermissionDone) {
    //   return res
    //     .status(400)
    //     .json({ message: "App permissions are not completed yet" });
    // }

    // ---------- Update personalInfo ----------
    rider.personalInfo = {
      fullName,
      dob,
      gender,
      primaryPhone,
      secondaryPhone,
      email,
    };

    // ---------- Update onboarding progress ----------
    rider.onboardingProgress.personalInfoSubmitted = true;

    // Move stage only if currently at PERSONAL_INFO
    if (rider.onboardingStage === "PERSONAL_INFO") {
      rider.onboardingStage = "SELFIE";
    }

    await rider.save();

    return res.status(200).json({
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
      message: "Error saving personal info",
      error: err.message,
    });
  }
};


// ------------------ LOCATION -------------------
// exports.updateLocation = async (req, res) => {
//   res.send("Update location logic");
// };

// ------------------ VEHICLE -------------------
exports.updateVehicle = async (req, res) => {
  const ALLOWED_VEHICLE_TYPES = ["ev", "bike", "scooty"];

  try {
    const  riderId  = req.rider?._id;
    const { type } = req.body;

    // 1. Basic validation
    if (!type) {
      return res.status(400).json({ message: "Vehicle type is required" });
    }

    if (!ALLOWED_VEHICLE_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid vehicle type" });
    }

    // 2. Fetch rider
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Optional: enforce flow – phone & permissions & location done

    // if (!rider.onboardingProgress.phoneVerified) {
    //   return res
    //     .status(400)
    //     .json({ message: "Phone number is not verified yet" });
    // }

    // if (!rider.onboardingProgress.appPermissionDone) {
    //   return res
    //     .status(400)
    //     .json({ message: "App permissions are not completed yet" });
    // }

    // if (!rider.onboardingProgress.citySelected) {
    //   return res.status(400).json({
    //     message: "Location is not selected yet",
    //   });
    // }

    // 3. Update vehicle info
    rider.vehicleInfo = { type };

    // 4. Update onboarding progress
    rider.onboardingProgress.vehicleSelected = true;

    // 5. Move stage SELECT_VEHICLE -> PERSONAL_INFO
    if (rider.onboardingStage === "SELECT_VEHICLE") {
      rider.onboardingStage = "PERSONAL_INFO";
    }

    await rider.save();

    return res.status(200).json({
      message: "Vehicle selected successfully",
      data: {
        riderId,
        vehicleInfo: rider.vehicleInfo,
        onboardingProgress: rider.onboardingProgress,
        onboardingStage: rider.onboardingStage,
      },
    });
  } catch (err) {
    console.error("Error selecting vehicle:", err);
    return res.status(500).json({
      message: "Error selecting vehicle",
      error: err.message,
    });
  }
};


// ------------------ SELFIE -------------------
exports.uploadSelfieController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Selfie file is required" });
    }

    // public path (served by express.static in server.js)
    const selfieUrl = path.posix.join("/uploads/selfies", req.file.filename);

    // OPTIONAL: Save selfie URL to rider doc if you have req.rider.id
    // if (req.rider && req.rider.id) {
    //   await Rider.findByIdAndUpdate(req.rider.id, {
    //     selfie: { url: selfieUrl, uploadedAt: new Date() },
    //     "onboardingProgress.selfieUploaded": true
    //   });
    // }

    return res.status(200).json({
      message: "Selfie uploaded successfully",
      selfieUrl,
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("uploadSelfieController err:", error);
    return res.status(500).json({ message: "Error uploading selfie", error: error.message });
  }
};
// ------------------ KYC -------------------
exports.uploadAadhar = async (req, res) => {
  res.send("Upload Aadhar logic");
};

exports.uploadPan = async (req, res) => {
  res.send("Upload PAN logic");
};


exports.uploadDL = async (req, res) => {
  try {
    const  riderId  = req.rider?._id;// take rider id from auth token

    if (!req.files.front || !req.files.back) {
      return res.status(400).json({
        success: false,
        message: "Front and back images are required",
      });
    }

    const frontImage = req.files.front[0].path;
    const backImage = req.files.back[0].path;

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider not found" });
    }

    // Update DL fields
    rider.kyc.drivingLicense.frontImage = frontImage;
    rider.kyc.drivingLicense.backImage = backImage;
    rider.kyc.drivingLicense.status = "approved";

    // Update onboarding progress
    rider.onboardingProgress.dlUploaded = true;

    // Move onboarding stage
    rider.onboardingStage = "KYC_SUBMITTED";

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Driving Licence uploaded successfully",
      data: rider.kyc.drivingLicense,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ------------------ PROFILE -------------------
exports.getProfile = async (req, res) => {
  res.send("Get profile logic");
};
