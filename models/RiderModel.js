const mongoose = require("mongoose");
const { Schema } = mongoose;

const RiderSchema = new Schema(
  {
    phone: {
      countryCode: { type: String, default: "+91" },
      number: { type: String, required: true },
      isVerified: { type: Boolean, default: false },
    },
    lastOtpVerifiedAt: Date,
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    isFullyRegistered: { type: Boolean, default: false },

    onboardingStage: {
      type: String,
      enum: [
        "PHONE_VERIFICATION",
        "APP_PERMISSIONS",
        "SELECT_LOCATION",
        "SELECT_VEHICLE",
        "PERSONAL_INFO",
        "SELFIE",
        "AADHAAR",
        "PAN_UPLOAD",
        "DL_UPLOAD",
        "KYC_SUBMITTED",
        "KYC_APPROVED",
        "COMPLETED",
      ],
      default: "PHONE_VERIFICATION",
    },

    onboardingProgress: {
      phoneVerified: { type: Boolean, default: false },
      appPermissionDone: { type: Boolean, default: false },
      citySelected: { type: Boolean, default: false },
      vehicleSelected: { type: Boolean, default: false },
      personalInfoSubmitted: { type: Boolean, default: false },
      selfieUploaded: { type: Boolean, default: false },
      aadharVerified: { type: Boolean, default: false },
      panUploaded: { type: Boolean, default: false },
      dlUploaded: { type: Boolean, default: false },
      rc: { type: Boolean, default: false },
    },
    permissions: {
      camera: { type: Boolean, default: false },
      foregroundLocation: { type: Boolean, default: false },
      backgroundLocation: { type: Boolean, default: false },
    },
    personalInfo: {
      fullName: { type: String },      
      dob: { type: Date },
      gender: { type: String, enum: ["male", "female", "other"] },
      primaryPhone: { type: String },    
      secondaryPhone: { type: String },
      email: { type: String },
    },

    location: {
        city: { type: String},
        area: { type: String }
    },

    vehicleInfo: {
      type: { type: String, enum: ["ev", "bike", "scooty"] },  
    },

    selfie: {
      url: { type: String },
      uploadedAt: { type: Date },
    },

    kyc: {
      aadhar: {
        isVerified: { type: Boolean, default: false },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        rejectionReason: String,
      },

      pan: {
        number: { type: String, trim: true },  
        image: { type: String },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        rejectionReason: String,
      },

      drivingLicense: {
        number: { type: String, trim: true },  
        frontImage: String,
        backImage: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        rejectionReason: String,
      },
      rc: {
        frontImage: { type: String },
        backImage: { type: String },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        rejectionReason: { type: String },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rider", RiderSchema);
