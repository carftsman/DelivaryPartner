const Rider = require("../models/RiderModel");

// SAVE FCM TOKEN

exports.saveFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  const riderId = req.rider._id;

  await Rider.findByIdAndUpdate(riderId, { fcmToken });
  res.json({ success: true });
};
