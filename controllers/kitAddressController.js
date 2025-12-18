const Rider = require("../models/RiderModel");
 
exports.addKitAddress = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { name, completeAddress, pincode } = req.body;
 
   
    if (!name || !completeAddress || !pincode) {
      return res.status(400).json({
        message: "Name, complete address and pincode are required",
      });
    }
 
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }
 
    // Update only required fields
    rider.kitDeliveryAddress = {
      name,
      completeAddress,
      pincode,
    };
 
    await rider.save();
 
    res.status(200).json({
      message: "Kit delivery address saved successfully",
      data: rider.kitDeliveryAddress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save kit delivery address",
      error: error.message,
    });
  }
};
 
 
exports.getKitAddress = async (req, res) => {
  try {
    const riderId = req.rider._id;
 
    const rider = await Rider.findById(
      riderId,
      "kitDeliveryAddress.name kitDeliveryAddress.completeAddress kitDeliveryAddress.pincode"
    );
 
    if (!rider || !rider.kitDeliveryAddress) {
      return res.status(404).json({
        message: "Kit delivery address not found",
      });
    }
 
    res.status(200).json({
      message: "Kit delivery address fetched successfully",
      data: rider.kitDeliveryAddress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch kit delivery address",
      error: error.message,
    });
  }
};