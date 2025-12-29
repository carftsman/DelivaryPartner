// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const RiderSchema = new Schema(
//   { 
//     phone: {
//       countryCode: { type: String, default: "+91" },
//       number: { type: String, required: true },
//       isVerified: { type: Boolean, default: false },
//     },
//     lastOtpVerifiedAt: Date,
//     otp: {
//       code: { type: String },
//       expiresAt: { type: Date },
//     },

//     isFullyRegistered: { type: Boolean, default: false },
    
//     refreshToken: { type: String },
//     deviceToken: { type: String, default: null },

//     onboardingStage: {
//       type: String,
//       enum: [
//         "PHONE_VERIFICATION",
//         "APP_PERMISSIONS",
//         "SELECT_LOCATION",
//         "SELECT_VEHICLE",
//         "PERSONAL_INFO",
//         "SELFIE",
//         "AADHAAR",
//         "PAN_UPLOAD",
//         "DL_UPLOAD",
//         "KYC_SUBMITTED",
//         "KYC_APPROVED",
//         "COMPLETED",
//       ],
//       default: "PHONE_VERIFICATION",
//     },

//     onboardingProgress: {
//       phoneVerified: { type: Boolean, default: false },
//       appPermissionDone: { type: Boolean, default: false },
//       citySelected: { type: Boolean, default: false },
//       vehicleSelected: { type: Boolean, default: false },
//       personalInfoSubmitted: { type: Boolean, default: false },
//       selfieUploaded: { type: Boolean, default: false },
//       aadharVerified: { type: Boolean, default: false },
//       panUploaded: { type: Boolean, default: false },
//       dlUploaded: { type: Boolean, default: false },
//     },
//     permissions: {
//       camera: { type: Boolean, default: false },
//       foregroundLocation: { type: Boolean, default: false },
//       backgroundLocation: { type: Boolean, default: false },
//     },
//     personalInfo: {
//       fullName: { type: String },      
//       dob: { type: Date },
//       gender: { type: String, enum: ["male", "female", "other"] },
//       primaryPhone: { type: String },    
//       secondaryPhone: { type: String },
//       email: { type: String },
//     }, 

//     location: {
//         city: { type: String},
//         area: { type: String }
//     },

//     vehicleInfo: {
//       type: { type: String, enum: ["ev", "bike", "scooty"] },  
//     },

//     selfie: {
//       url: { type: String },
//       uploadedAt: { type: Date },
//     },

//     kyc: {
//       aadhar: {
//         isVerified: { type: Boolean, default: false },
//         status: {
//           type: String,
//           enum: ["pending", "approved", "rejected"],
//           default: "pending",
//         },
//         rejectionReason: String,
//       },

//       pan: {
//         number: { type: String, trim: true },  
//         image: { type: String },
//         status: {
//           type: String,
//           enum: ["pending", "approved", "rejected"],
//           default: "pending",
//         },
//         rejectionReason: String,
//       },

//       drivingLicense: {
//         number: { type: String, trim: true },  
//         frontImage: String,
//         backImage: String,
//         status: {
//           type: String,
//           enum: ["pending", "approved", "rejected"],
//           default: "pending",
//         },
//         rejectionReason: String,
//       },
//     },
//     // Additional fields can be added as needed

//     bankDetails: {
//       bankName: { type: String, trim: true },

//       accountHolderName: { type: String, trim: true },

//       accountNumber: {
//         type: String,
//         trim: true,
//         minlength: 8,
//         maxlength: 20,
//       },

//       ifscCode: {
//         type: String,
//         trim: true,
//         uppercase: true,
//         match: /^[A-Z]{4}0[A-Z0-9]{6}$/
//       },

//       addedBankAccount: { type: Boolean, default: false }
//     },

//     kitDeliveryAddress: {
//       name: { type: String, trim: true },

//       mobileNumber: {
//         type: String,
//         match: /^[0-9]{10}$/
//       },

//       completeAddress: {
//         type: String,
//         trim: true,
//         minlength: 10,
//         maxlength: 200
//       },

//       landmark: { type: String, trim: true },

//       pincode: {
//         type: String,
//         match: /^[0-9]{6}$/
//       },

//       onboardingKitStatus: {
//         type: Boolean,
//         default: false
//       }
//     },


//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Rider", RiderSchema);



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
   
    refreshToken: { type: String },
    deviceToken: { type: String, default: null },
 
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
        "KYC_APPROVAL_PENDING"
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
    },
 
    permissions: {
      camera: { type: Boolean, default: false },
      foregroundLocation: { type: Boolean, default: false },
      backgroundLocation: { type: Boolean, default: false },
    },
 
    riderStatus: {
      isOnline: { type: Boolean, default: false },
      lastOnlineAt: Date
    },
 
    gps: {
      isEnabled: Boolean,
      lastLocation: {
        lat: Number,
        lng: Number,
        updatedAt: Date
      }
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
    },
    // Additional fields can be added as needed
 
    bankDetails: {
      bankName: { type: String, trim: true },
 
      accountHolderName: { type: String, trim: true },
 
      accountNumber: {
        type: String,
        trim: true,
        minlength: 8,
        maxlength: 20,
      },
 
      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        match: /^[A-Z]{4}0[A-Z0-9]{6}$/
      },
 
      addedBankAccount: { type: Boolean, default: false }
    },
 
    wallet: {
      balance: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      totalWithdrawn: { type: Number, default: 0 }
    },
 
 
    kitDeliveryAddress: {
      name: { type: String, trim: true },
 
      mobileNumber: {
        type: String,
        match: /^[0-9]{10}$/
      },
 
      completeAddress: {
        type: String,
        trim: true,
        minlength: 10,
        maxlength: 200
      },
 
      landmark: { type: String, trim: true },
 
      pincode: {
        type: String,
        match: /^[0-9]{6}$/
      },
 
      onboardingKitStatus: {
        type: Boolean,
        default: false
      }
    },
 
 
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Rider", RiderSchema);
