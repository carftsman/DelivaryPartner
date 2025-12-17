const express = require("express");
const adminRouter = express.Router();
const { approveRiderKyc } = require("../controllers/adminController");

adminRouter.put("/approve-kyc/:riderId", approveRiderKyc);

module.exports = adminRouter;
