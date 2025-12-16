// const express = require("express");
// const router = express.Router();

// const {
//   sendStaticMobileOtp,
//   verifyStaticMobileOtp
// } = require("../controllers/staticMobileOtpController");

// router.post("/send-static-otp", sendStaticMobileOtp);
// router.post("/verify-static-otp", verifyStaticMobileOtp);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  sendStaticMobileOtp,
  verifyStaticMobileOtp,
  refreshAccessToken
} = require("../controllers/staticMobileOtpController");

router.post("/send-static-otp", sendStaticMobileOtp);
router.post("/verify-static-otp", verifyStaticMobileOtp);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
