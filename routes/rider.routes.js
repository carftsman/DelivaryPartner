const express = require("express");
const router = express.Router();

// ✅ CHANGE IS HERE (Destructuring Import)
const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");

const {
  markDelivered,
  getDashboard,
  getOrders,
  getSlotHistory,
  getWallet
} = require("../controllers/rider.controller");


// ==============================
// POST
// ==============================

router.post("/order/deliver", riderAuthMiddleWare, markDelivered);

// ==============================
// GET
// ==============================

router.get("/dashboard", riderAuthMiddleWare, getDashboard);
router.get("/orders", riderAuthMiddleWare, getOrders);
router.get("/slot-history", riderAuthMiddleWare, getSlotHistory);
router.get("/wallet", riderAuthMiddleWare, getWallet);

module.exports = router;
