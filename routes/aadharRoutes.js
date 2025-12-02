const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../controllers/aadharController");
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

router.post("/send-otp", riderAuthMiddleWare, sendOtp);
router.post("/verify-otp", riderAuthMiddleWare, verifyOtp);

module.exports = router;
