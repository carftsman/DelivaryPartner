const Notification = require("../models/notifications.model.js");

// CREATE NOTIFICATION
exports.createNotification = async (req, res) => {
  try {
    const rider = req.rider;

    const { title, message, type, orderId, offerId, meta, redirectTo } = req.body;

    const notification = await Notification.create({
      userId: rider._id,
      title,
      message,
      type,
      orderId: orderId || null,
      offerId: offerId || null,
      meta: meta || {},
      redirectTo: redirectTo || null
    });

    res.status(201).json({
      success: true,
      message: "Notification created",
      data: notification
    });

  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET ALL NOTIFICATIONS FOR RIDER
exports.getNotifications = async (req, res) => {
  try {
    const rider = req.rider;

    const notifications = await Notification.find({ userId: rider._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });

  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    const rider = req.rider;
    const { notificationId } = req.params;

    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: rider._id },
      { isRead: true },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.json({
      success: true,
      message: "Notification marked as read",
      data: updated
    });

  } catch (err) {
    console.error("Mark Read Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const rider = req.rider;
    const { notificationId } = req.params;

    const deleted = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: rider._id
    });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.json({
      success: true,
      message: "Notification deleted"
    });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
