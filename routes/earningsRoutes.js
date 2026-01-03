const express = require("express");
const earningsRouter = express.Router()

const {
    getEarningsOrders,
  getEarningOrderDetail
} = require("../controllers/earningsController");

const {riderAuthMiddleWare} = require("../middleware/riderAuthMiddleware.js");  // rideruth

// console.log("riderAuth type:", typeof riderAuthMiddleWare);
// console.log("getEarningsOrders type:", typeof getEarningsOrders);

earningsRouter.get("/orders", riderAuthMiddleWare, getEarningsOrders);
earningsRouter.get("/orders/:orderId", riderAuthMiddleWare, getEarningOrderDetail);

module.exports = earningsRouter;
