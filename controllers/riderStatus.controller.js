const Rider = require("../models/RiderModel");

exports.goOnline = async (req, res) => {
  try {

    const riderId = req.rider._id;

    // ------------------------
    // COD LIMIT CHECK
    // ------------------------

    const riderData = await Rider.findById(riderId);

    if (!riderData) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    // if (riderData.cashInHand.balance >= riderData.cashInHand.limit) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "COD limit exceeded. Clear cash to go online"
    //   });
    // }

    if (riderData.riderStatus.isOnline) {
      return res.status(400).json({
        success: false,
        message: "Rider already online"
      });
    }

    // ------------------------
    // ATOMIC UPDATE
    // ------------------------

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      {
        $set: {
          "riderStatus.isOnline": true,
          "riderStatus.lastLoginAt": new Date(),
          "riderStatus.lastLogoutAt": null
        }
      },
      { new: true }
    );

    // ------------------------
    // RESPONSE
    // ------------------------

    res.status(200).json({
      success: true,
      message: "Rider is now ONLINE",
      riderStatus: {
        isOnline: rider.riderStatus.isOnline,
        lastLoginAt: rider.riderStatus.lastLoginAt,
        lastLogoutAt: rider.riderStatus.lastLogoutAt,
        totalOnlineMinutesToday: rider.riderStatus.totalOnlineMinutesToday
      }
    });

  } catch (error) {
    console.error("GO ONLINE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
exports.goOffline = async (req, res) => {
  try {

    const riderId = req.rider._id;

    const riderData = await Rider.findById(riderId);

    if (!riderData || !riderData.riderStatus.isOnline) {
      return res.status(400).json({
        success: false,
        message: "Rider already offline"
      });
    }

    const logoutTime = new Date();
    const loginTime = riderData.riderStatus.lastLoginAt;

    // ------------------------
    // SESSION CALCULATION
    // ------------------------

    const diffMs = logoutTime - loginTime;
    const sessionMinutes = Math.floor(diffMs / 60000);

    const updatedTotalMinutes =
      riderData.riderStatus.totalOnlineMinutesToday + sessionMinutes;

    // ------------------------
    // ATOMIC UPDATE
    // ------------------------

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      {
        $set: {
          "riderStatus.isOnline": false,
          "riderStatus.lastLogoutAt": logoutTime,
          "riderStatus.totalOnlineMinutesToday": updatedTotalMinutes
        }
      },
      { new: true }
    );

    // ------------------------
    // RESPONSE
    // ------------------------

    res.status(200).json({
      success: true,
      message: "Rider is now OFFLINE",
      riderStatus: {
        isOnline: rider.riderStatus.isOnline,
        lastLoginAt: rider.riderStatus.lastLoginAt,
        lastLogoutAt: rider.riderStatus.lastLogoutAt,
        totalOnlineMinutesToday: rider.riderStatus.totalOnlineMinutesToday
      }
    });

  } catch (error) {
    console.error("GO OFFLINE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
