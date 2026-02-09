const Rider = require("../models/RiderModel");
const { isKycComplete } = require("../utils/checkKycCompletion");
const { generatePartnerId } = require("../utils/generatePartnerId");

exports.updateRiderAndCheckPartner = async (query, updateData) => {
  // 1️⃣ Update rider
  const rider = await Rider.findOneAndUpdate(
    query,
    { $set: updateData },
    { new: true }
  );

  if (!rider) return null;

  // 2️⃣ Check if partnerId already exists
  if (rider.partnerId) return rider;

  // 3️⃣ Check KYC completeness
  if (isKycComplete(rider)) {
    rider.partnerId = generatePartnerId();
    rider.isPartnerActive = true;

    rider.deliveryStatus.isActive = true;
    rider.deliveryStatus.updatedAt = new Date();

    await rider.save();
  }

  return rider;
};
