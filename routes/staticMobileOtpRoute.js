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
const staticRouter = express.Router();

const {
  sendStaticMobileOtp,
  verifyStaticMobileOtp,
  refreshAccessToken
} = require("../controllers/staticMobileOtpController");

staticRouter.post("/send-static-otp", sendStaticMobileOtp);
staticRouter.post("/verify-static-otp", verifyStaticMobileOtp);
staticRouter.post("/refresh-token", refreshAccessToken);

module.exports = staticRouter;