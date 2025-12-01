const Rider = require("../models/RiderModel");
const jwt = require("jsonwebtoken");

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
exports.updatePersonalInfo = async (req, res) => {
  res.send("Update personal info logic");
};

// ------------------ LOCATION -------------------
// exports.updateLocation = async (req, res) => {
//   res.send("Update location logic");
// };

// ------------------ VEHICLE -------------------
exports.updateVehicle = async (req, res) => {
  res.send("Update vehicle logic");
};

// ------------------ SELFIE -------------------
exports.uploadSelfie = async (req, res) => {
  res.send("Upload selfie logic");
};

// ------------------ KYC -------------------
exports.uploadAadhar = async (req, res) => {
  res.send("Upload Aadhar logic");
};

exports.uploadPan = async (req, res) => {
  res.send("Upload PAN logic");
};

exports.uploadDL = async (req, res) => {
  res.send("Upload DL logic");
};

// ------------------ PROFILE -------------------
exports.getProfile = async (req, res) => {
  res.send("Get profile logic");
};
