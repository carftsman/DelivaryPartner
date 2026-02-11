const express = require("express");
const router = express.Router();

// ✅ destructure named export
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

const {
  getDayIncentive,
  getPeakIncentive,
  getWeekIncentive
} = require("../controllers/riderIncentiveProgressController");

// 🔐 riderId comes from token → req.rider._id
router.get("/day", riderAuthMiddleWare, getDayIncentive);
router.get("/peak", riderAuthMiddleWare, getPeakIncentive);
router.get("/week", riderAuthMiddleWare, getWeekIncentive);

module.exports = router;
