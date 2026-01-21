const express = require("express");
const { adminIncentiveController } = require("../controllers/adminIncentiveController");
const adminRouterIncentives = express.Router();

adminRouterIncentives.get("/weekly",adminIncentiveController);

module.exports = adminRouterIncentives;
