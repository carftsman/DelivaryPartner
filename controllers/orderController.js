const Order = require("../models/OrderSchema");
const mongoose = require("mongoose");
 
exports.createOrder = async (req, res) => {
 try {
   const {
     vendorShopName,
     items,
     pickupAddress,
     deliveryAddress,
     pricing,
     payment,
     userId
   } = req.body;
 
   // Basic validation
   if (!vendorShopName || !items?.length || !pickupAddress || !deliveryAddress) {
     return res.status(400).json({ message: "Missing required fields" });
   }
 
   // Calculate item total (server-side – never trust frontend)
   const itemTotal = items.reduce(
     (sum, item) => sum + item.quantity * item.price,
     0
   );
 
   // Generate readable orderId
   const orderId = `ORD-${Date.now()}`;
 
   const order = await Order.create({
     orderId,
     vendorShopName,
     userId: userId ? new mongoose.Types.ObjectId(userId) : null,
     items: items.map(i => ({
       ...i,
       total: i.quantity * i.price
     })),
     pickupAddress,
     deliveryAddress,
     pricing: {
       ...pricing,
       itemTotal,
       totalAmount:
         itemTotal +
        (pricing?.deliveryFee || 0) +
        (pricing?.tax || 0)
     },
     payment,
     orderStatus: "CREATED"
   });
 
   return res.status(201).json({
     message: "Order created successfully",
     order
   });
 
 } catch (error) {
  console.error("Create Order Error:", error);
  res.status(500).json({ message: "Internal server error" });
 }
};



exports.confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
 
    const order = await Order.findOne({ orderId });
 
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 
    // 🔒 Only allow CREATED → CONFIRMED
    if (order.orderStatus !== "CREATED") {
      return res.status(400).json({
        message: `Order cannot be confirmed from status ${order.orderStatus}`
      });
    }
 
    order.orderStatus = "CONFIRMED";
    await order.save();
 
    return res.json({
      message: "Order confirmed successfully",
      order
    });
 
  } catch (error) {
    console.error("Confirm Order Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.assignOrderToRider = async (req, res) => {

  const { orderId } = req.params;

  const { riderId } = req.body;
 
  const order = await Order.findOne({ orderId });

  if (!order) return res.status(404).json({ message: "Order not found" });
 
  if (order.orderStatus !== "CONFIRMED") {

    return res.status(400).json({ message: "Invalid order state" });

  }
 
  order.orderStatus = "ASSIGNED";

  order.riderId = riderId;

  await order.save();
 
  // 🔥 SEND WS MESSAGE

  const riderSocket = global.wsClients.get(riderId);
console.log("Socket found:", riderSocket ? "YES" : "NO");
 
  if (riderSocket && riderSocket.readyState === 1) {

    riderSocket.send(

      JSON.stringify({

        type: "ORDER_ASSIGNED",

        payload: {

          orderId: order.orderId,

          pickupAddress: order.pickupAddress,

          deliveryAddress: order.deliveryAddress

        }

      })

    );

  }
 
  res.json({ message: "Order assigned", order });

};

 exports.acceptOrder = async (req, res) => {
  try {
    
    const { orderId } = req.params;
    const { riderId } = req.body;
 
    if (!riderId) {
      return res.status(400).json({ message: "riderId is required" });
    }
 
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 
    if (order.orderStatus !== "ASSIGNED") {
      return res.status(400).json({
        message: "Only ASSIGNED orders can be accepted"
      });
    }
 
    if (order.riderId.toString() !== riderId) {
      return res.status(403).json({
        message: "This order is not assigned to you"
      });
    }
 
    // Accept = lock the assignment
    order.assignmentAcceptedAt = new Date(); // optional field
    await order.save();
 
    return res.json({
      message: "Order accepted successfully",
      order
    });
 
  } catch (error) {
    console.error("Accept Order Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.rejectOrder = async (req, res) => {

  try {

    const { orderId } = req.params;

    const { riderId, reason } = req.body;
 
    if (!riderId) {

      return res.status(400).json({ message: "riderId is required" });

    }
 
    const order = await Order.findOne({ orderId });

    if (!order) {

      return res.status(404).json({ message: "Order not found" });

    }
 
    if (order.orderStatus !== "ASSIGNED") {

      return res.status(400).json({

        message: "Only ASSIGNED orders can be rejected"

      });

    }
 
    if (order.riderId.toString() !== riderId) {

      return res.status(403).json({

        message: "This order is not assigned to you"

      });

    }
 
    // Reject → unassign

    order.riderId = null;

    order.orderStatus = "CONFIRMED";

    order.rejectReason = reason || "Rider rejected";
 
    await order.save();
 
    return res.json({

      message: "Order rejected and unassigned",

      order

    });
 
  } catch (error) {

    console.error("Reject Order Error:", error);

    res.status(500).json({ message: "Internal server error" });

  }

};


exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.query; // important for security
 
    const order = await Order.findOne({ orderId })
      .populate("riderId", "name phone") // optional
      .lean();
 
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 
    // 🔐 Rider can see details ONLY if:
    // ASSIGNED / PICKED_UP / DELIVERED
    if (
      order.orderStatus === "ASSIGNED" ||
      order.orderStatus === "PICKED_UP" ||
      order.orderStatus === "DELIVERED"
    ) {
      if (!order.riderId || order.riderId._id.toString() !== riderId) {
        return res.status(403).json({
          message: "You are not allowed to view this order"
        });
      }
    }
 
    return res.json({
      message: "Order details fetched",
      order
    });
 
  } catch (error) {
    console.error("Get Order Details Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.pickupOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;
 
    if (!riderId) {
      return res.status(400).json({ message: "riderId is required" });
    }
 
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 
    // 🔐 Only assigned rider can pickup
    if (order.orderStatus !== "ASSIGNED") {
      return res.status(400).json({
        message: "Order is not ready for pickup"
      });
    }
 
    if (!order.riderId || order.riderId.toString() !== riderId) {
      return res.status(403).json({
        message: "This order is not assigned to you"
      });
    }
 
    // ✅ Pickup
    order.orderStatus = "PICKED_UP";
    order.pickedUpAt = new Date(); // optional but recommended
 
    await order.save();
 
    // 🔥 Notify (optional)
    if (global.wsClients?.has(riderId)) {
      const ws = global.wsClients.get(riderId);
      if (ws.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: "ORDER_PICKED_UP",
            payload: {
              orderId: order.orderId
            }
          })
        );
      }
    }
 
    return res.json({
      message: "Order picked up successfully",
      order
    });
 
  } catch (error) {
    console.error("Pickup Order Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

 