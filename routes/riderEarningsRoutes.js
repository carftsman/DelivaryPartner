const express = require("express");
const riderEarningsRouter = express.Router();

const { riderAuthMiddleWare } = require("../middleware/riderAuthMiddleware");
const { getEarningsSummary , getWeeklyChart ,getDailyEarnings , getDeliveryEarnings , getWeeklyEarnings } = require("../controllers/riderEarningsController");

riderEarningsRouter.get("/new/summary", riderAuthMiddleWare, getEarningsSummary);
riderEarningsRouter.get("/new/weekly-chart", riderAuthMiddleWare, getWeeklyChart);


riderEarningsRouter.get("/new/daily", riderAuthMiddleWare, getDailyEarnings);
riderEarningsRouter.get("/new/delivery/:orderId", riderAuthMiddleWare, getDeliveryEarnings);
riderEarningsRouter.get("/new/weekly", riderAuthMiddleWare, getWeeklyEarnings);
// riderEarningsRouter.get("/new/history", riderAuthMiddleWare, getEarningsHistory);


module.exports = riderEarningsRouter;