// const Rider = require("../models/RiderModel");

// exports.uploadPan = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "PAN image is required",
//       });
//     }

//     const rider = req.rider;
//     const filePath = `/uploads/pan/${req.file.filename}`;

//     await Rider.findByIdAndUpdate(rider._id, {
//       $set: {
//         "kyc.pan.image": filePath,
//         "kyc.pan.status": "pending",
//         "onboardingStage": "DL_UPLOAD",
//         "onboardingProgress.panUploaded": true,
//       },
//     });

//     return res.json({
//       success: true,
//       message: "PAN uploaded successfully",
//       imageUrl: filePath,
//     });
//   } catch (error) {
//     console.error("PAN Upload Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while uploading PAN",
//     });
//   }
// };
