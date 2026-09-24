const Notification = require('../models/Notification');

// @desc  Get my notifications
// @route GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, unreadOnly } = req.query;
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const total = await Notification.countDocuments(filter);

    res.json({ notifications, total, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark notification as read
// @route PATCH /api/notifications/:id/read
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark all as read
// @route PATCH /api/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete notification
// @route DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
