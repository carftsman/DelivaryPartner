const express = require("express");
const router = express.Router();
const {
  withdrawFromWallet,
  handoverCodCash
} = require("../controllers/riderCashController");

// const {riderAuthMiddleWare} = require("../middleware/riderAuthMiddleware");
router.post(
  "/rider/cod/handover",
//   riderAuthMiddleWare,
  handoverCodCash
);

router.post(
  "/rider/wallet/withdraw",
//   riderAuthMiddleWare,
  withdrawFromWallet
);
module.exports = router; 