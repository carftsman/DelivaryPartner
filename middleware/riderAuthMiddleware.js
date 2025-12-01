const jwt = require("jsonwebtoken");
const Rider = require("../models/RiderModel");

exports.riderAuthMiddleWare = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    // No token → block request
    if (!token || !token.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization token missing" });
    }

    token = token.split(" ")[1]; // remove "Bearer "

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.riderId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
    }

    // Check rider in DB
    const rider = await Rider.findById(decoded.riderId);
    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "Rider not found" });
    }

    // Attaching rider to request object
    req.rider = rider;

    next(); // allow controller to run
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Session expired, please login again"
          : "Authentication failed",
    });
  }
};
