const Order = require("../models/OrderSchema");
const crypto = require("crypto");
const {notifyRider} = require("../webSocket");
const Rider=require('../models/RiderModel')

async function createOrder(req, res) {
  try {
    const {
      vendorShopName,
      items,
      pickupAddress,
      deliveryAddress,
      payment
    } = req.body;
 
    if (!vendorShopName) {
      return res.status(400).json({
        success: false,
        message: "vendorShopName is required"
      });
    }
 
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Items are required"
      });
    }
 
    // 🔹 Calculate item totals ONLY
    let itemTotal = 0;
    const formattedItems = items.map(item => {
      const total = item.quantity * item.price;
      itemTotal += total;
      return {
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        total
      };
    });
 
    // 🔹 Generate Order ID
    const orderId =
      "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();
 
    // 🔹 Create Order (NO dynamic data)
    const order = await Order.create({
      orderId,
      vendorShopName,
      items: formattedItems,
      pickupAddress,
      deliveryAddress,
 
      pricing: {
        itemTotal,
        deliveryFee: 0,
        tax: 0,
        platformCommission: 0,
        totalAmount: itemTotal
      },
 
      riderEarning: {
        basePay: 0,
        distancePay: 0,
        surgePay: 0,
        tips: 0,
        totalEarning: 0,
        credited: false
      },
 
      payment: {
        mode: payment.mode,
        status: payment.mode === "COD" ? "PENDING" : "SUCCESS"
      },
 
      orderStatus: "CREATED"
    });
 
    return res.status(201).json({
      success: true,
      orderId: order.orderId,
      mongoId: order._id
    });
 
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Order creation failed"
    });
  }
}
 
 
async function confirmOrder(req, res) {
  try {
    const { orderId } = req.params;
 
    // 1️⃣ Find order
    const order = await Order.findOne({ orderId });
 
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
 
    if (order.orderStatus !== "CREATED") {
      return res.status(400).json({
        success: false,
        message: "Order already processed"
      });
    }
 
    // 2️⃣ Fetch 5 eligible riders
    const riders = await Rider.find({
      "deliveryStatus.isActive": true,
      orderState: "READY",
      "riderStatus.isOnline": true
    })
      .limit(5)
      .select("_id");
 
    if (!riders.length) {
      return res.status(400).json({
        success: false,
        message: "No riders available"
      });
    }
 
    // 3️⃣ Update order
    order.orderStatus = "CONFIRMED";
    order.allocation = {
      candidateRiders: riders.map(r => ({
        riderId: r._id,
        status: "PENDING",
        notifiedAt: new Date()
      })),
      expiresAt: new Date(Date.now() + 30 * 1000) // 30 sec window
    };
 
    await order.save();
 
    // 4️⃣ Notify riders via WebSocket
    riders.forEach(rider => {
      notifyRider(rider._id.toString(), {
        type: "ORDER_POPUP",
        orderId: order.orderId,
        vendorShopName: order.vendorShopName
      });
    });
 
    return res.json({
      success: true,
      message: "Order confirmed and sent to riders",
      notifiedRiders: riders.length
    });
 
  } catch (err) {
    console.error("Confirm order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to confirm order"
    });
  }
}




async function acceptOrder(req, res) {

  try {

    const { orderId } = req.params;

    const { riderId } = req.body;
 
    const now = new Date();
 
    const order = await Order.findOneAndUpdate(

      {

        orderId,

        orderStatus: "CONFIRMED",

        riderId: null,

        "allocation.expiresAt": { $gt: now },

        "allocation.candidateRiders": {

          $elemMatch: {

            riderId,

            status: "PENDING"

          }

        }

      },

      {

        $set: {

          riderId,

          orderStatus: "ASSIGNED",

          "allocation.assignedAt": now,

          "allocation.candidateRiders.$[r].status": "ACCEPTED"

        }

      },

      {

        new: true,

        arrayFilters: [{ "r.riderId": riderId }]

      }

    );
 
    if (!order) {

      return res.status(409).json({

        success: false,

        message: "Order already assigned or expired"

      });

    }
 
    // Mark others as REJECTED

    await Order.updateOne(

      { orderId },

      {

        $set: {

          "allocation.candidateRiders.$[r].status": "REJECTED"

        }

      },

      {

        arrayFilters: [

          { "r.riderId": { $ne: riderId }, "r.status": "PENDING" }

        ]

      }

    );
 
    return res.json({

      success: true,

      message: "Order assigned successfully",

      orderId: order.orderId

    });
 
  } catch (err) {

    console.error("Accept order error:", err);

    return res.status(500).json({

      success: false,

      message: "Failed to accept order"

    });

  }

}

 

 


// async function rejectOrder(req, res) {
//   try {
//     const { orderId } = req.params;
//     const { riderId, reason } = req.body;

//     if (!riderId) {
//       return res.status(400).json({
//         success: false,
//         message: "riderId is required"
//       });
//     }

//     // 1️⃣ Find order
//     const order = await Order.findOne({ orderId });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     // 2️⃣ Order must be CONFIRMED
//     if (order.orderStatus !== "CONFIRMED") {
//       return res.status(400).json({
//         success: false,
//         message: "Order cannot be rejected at this stage"
//       });
//     }

//     // 3️⃣ Check allocation expiry
//     if (order.allocation?.expiresAt < new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: "Order rejection window expired"
//       });
//     }

//     // 4️⃣ Find rider in allocation list
//     const riderEntry = order.allocation.candidateRiders.find(
//       r => r.riderId.toString() === riderId
//     );

//     if (!riderEntry) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not eligible for this order"
//       });
//     }

//     // 5️⃣ Check status
//     if (riderEntry.status !== "PENDING") {
//       return res.status(400).json({
//         success: false,
//         message: "Order already accepted or rejected"
//       });
//     }

//     // 6️⃣ Reject this rider
//     riderEntry.status = "REJECTED";
//     riderEntry.rejectedAt = new Date();
//     riderEntry.rejectReason = reason || "Not specified";

//     // 7️⃣ Check if ALL riders rejected
//     const allRejected = order.allocation.candidateRiders.every(
//       r => r.status === "REJECTED"
//     );

//     if (allRejected) {
//       // You can change this behavior if needed
//       order.orderStatus = "CREATED"; // or keep CONFIRMED for reassignment
//       order.allocation = undefined;
//     }

//     await order.save();

//     return res.json({
//       success: true,
//       message: "Order rejected successfully",
//       orderId: order.orderId,
//       allRidersRejected: allRejected
//     });

//   } catch (err) {
//     console.error("Reject order error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to reject order"
//     });
//   }
// }



async function rejectOrder(req, res) {
  try {
    const { orderId } = req.params;
    const { riderId, reason } = req.body;
 
    const result = await Order.findOneAndUpdate(
      {
        orderId,
        orderStatus: "CONFIRMED",
        riderId: null,
        "allocation.candidateRiders": {
          $elemMatch: {
            riderId,
            status: "PENDING"
          }
        }
      },
      {
        $set: {
          "allocation.candidateRiders.$[r].status": "REJECTED",
          "allocation.candidateRiders.$[r].rejectedAt": new Date(),
          "allocation.candidateRiders.$[r].rejectReason": reason || null
        }
      },
      {
        new: true,
        arrayFilters: [
          { "r.riderId": riderId, "r.status": "PENDING" }
        ]
      }
    );
 
    if (!result) {
      return res.status(409).json({
        success: false,
        message: "Order already assigned or cannot be rejected"
      });
    }
 
    const pendingCount = result.allocation.candidateRiders.filter(
      r => r.status === "PENDING"
    ).length;
 
    return res.json({
      success: true,
      message: "Order rejected successfully",
      pendingRiders: pendingCount
    });
 
  } catch (err) {
    console.error("Reject order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reject order"
    });
  }
}


async function getOrderDetails(req, res) {
  try {
    const { orderId } = req.params;

    // 1️⃣ Find order
    const order = await Order.findOne({ orderId })
      .populate("riderId", "name phone") // optional, if rider assigned
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


     const filteredOrder = {
      _id: order._id,
      orderId: order.orderId,
      vendorShopName: order.vendorShopName,
      items: order.items,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      pricing: order.pricing
    };


    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      filteredOrder
    });

  } catch (err) {
    console.error("Get order details error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details"
    });
  }
}



 
 
 
module.exports = { createOrder,confirmOrder,acceptOrder,rejectOrder,getOrderDetails };
 
 