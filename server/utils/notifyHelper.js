const User = require('../models/User');
const { sendNotificationEmail } = require('./emailService');

/**
 * Send email notification for one or many users (replaces in-app notification feed)
 * @param {Object} opts
 * @param {string|string[]|Object[]} opts.recipients - user ID(s) or user objects with email
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} opts.type - 'assignment'|'exam'|'material'|'event'|'placement'|'attendance'|'general'
 * @param {string} [opts.link] - frontend route link
 * @param {Object} [opts.metadata] - key/value metadata details
 */
const notify = async (opts) => {
  try {
    const { recipients, title, message, type = 'general', link = '/dashboard', metadata = {} } = opts;
    if (!recipients) return;

    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
    if (recipientArray.length === 0) return;

    // Check if recipients are IDs or User objects
    let usersToNotify = [];
    const isIds = typeof recipientArray[0] === 'string' || recipientArray[0] instanceof require('mongoose').Types.ObjectId;

    if (isIds) {
      usersToNotify = await User.find({ _id: { $in: recipientArray } }).select('_id name email isVerified').lean();
    } else {
      usersToNotify = recipientArray;
    }

    // Send emails asynchronously in parallel batches
    const emailPromises = usersToNotify
      .filter((u) => u && u.email)
      .map((user) =>
        sendNotificationEmail({
          to: user.email,
          recipientId: user._id,
          name: user.name,
          subject: title || 'University Campus Notification',
          title: title || 'Campus Update',
          message: message || '',
          category: type,
          actionUrl: link,
          actionText: 'View in UniSphere',
          metadata,
        })
      );

    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.error('⚠️ notifyHelper error:', error.message);
  }
};

module.exports = { notify };
