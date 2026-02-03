const Rider = require("../models/RiderModel");
const Order = require("../models/OrderSchema");
exports.handoverCodCash = async (req, res) => {
  try {
    if (!req.rider || !req.rider._id) {
      return res.status(400).json({
        success: false,
        message: "Rider info missing"
      });
    }

    const riderId = req.rider._id;
    const { amount } = req.body;

    // 1️⃣ Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid handover amount"
      });
    }

    // 2️⃣ Fetch rider cash-in-hand
    const rider = await Rider.findById(riderId)
      .select("cashInHand")
      .lean();

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    const availableCash = rider.cashInHand?.balance || 0;

    if (amount > availableCash) {
      return res.status(400).json({
        success: false,
        message: "Handover amount exceeds available cash"
      });
    }

    // 3️⃣ Reduce rider cash balance
    const updatedBalance = availableCash - amount;

    await Rider.updateOne(
      { _id: riderId },
      { $set: { "cashInHand.balance": updatedBalance } }
    );

    // 4️⃣ Apply handover to COD orders (FIFO)
    let remainingAmount = amount;

    const codOrders = await Order.find({
      riderId,
      "payment.mode": "COD",
      "cod.status": { $in: ["PENDING", "PARTIALLY_DEPOSITED"] }
    }).sort({ "cod.collectedAt": 1 });

    for (const order of codOrders) {
      if (remainingAmount <= 0) break;

      const pending = order.cod.pendingAmount;

      if (pending <= remainingAmount) {
        // Fully deposited
        remainingAmount -= pending;
        order.cod.pendingAmount = 0;
        order.cod.status = "DEPOSITED";
        order.cod.depositedAt = new Date();
      } else {
        // Partial deposit
        order.cod.pendingAmount -= remainingAmount;
        remainingAmount = 0;
        order.cod.status = "PARTIALLY_DEPOSITED";
      }

      await order.save();
    }

    // 5️⃣ Response
    return res.status(200).json({
      success: true,
      message: "COD cash handed over successfully",
      data: {
        handedOverAmount: amount,
        remainingCashBalance: updatedBalance,
        currency: "INR"
      }
    });

  } catch (error) {
    console.error("COD HANDOVER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to handover COD cash"
    });
  }
};

exports.withdrawFromWallet = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const { amount } = req.body;

    // 1️⃣ Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount"
      });
    }

    // 2️⃣ Fetch rider wallet
    const rider = await Rider.findById(riderId).select("wallet").lean();
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    const availableBalance = rider.wallet.balance;

    // 3️⃣ Business rules
    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal amount is ₹500"
      });
    }

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance"
      });
    }

    // 4️⃣ Calculate new balance
    const updatedBalance = availableBalance - amount;

    // 5️⃣ Generate transaction ID
    const transactionId = `WD-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // 6️⃣ Save transaction
    await WalletTransaction.create({
      riderId,
      transactionId,
      type: "WITHDRAW",
      amount,
      balanceAfterTransaction: updatedBalance,
      status: "SUCCESS"
    });

    // 7️⃣ Update rider wallet
    await Rider.updateOne(
      { _id: riderId },
      { $set: { "wallet.balance": updatedBalance } }
    );

    // 8️⃣ Response
    return res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      data: {
        transactionId,
        withdrawnAmount: amount,
        availableBalance: updatedBalance,
        currency: "INR"
      }
    });

  } catch (error) {
    console.error("WITHDRAW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to withdraw amount"
    });
  }
};
