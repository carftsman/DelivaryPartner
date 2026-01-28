const express = require("express");
const router = express.Router();
const {riderAuthMiddleWare} = require("../middleware/riderAuthMiddleware");
const {
  raiseAssetIssue,
  getRiderAssets,
} = require("../controllers/riderAssetsController");



router.get("/", riderAuthMiddleWare, getRiderAssets);
router.post("/issues", riderAuthMiddleWare, raiseAssetIssue);

module.exports = router;
