const express = require('express');
const fcmRouter = express.Router();
const { saveFcmToken } = require('../controllers/fcmTokenController');
const {riderAuthMiddleWare} = require("../middleware/riderAuthMiddleware");


fcmRouter.post('/fcm-token', riderAuthMiddleWare, saveFcmToken);

module.exports = fcmRouter;