const Notification = require('../models/Notification');

/**
 * Create a notification for one or many users
 * @param {Object} opts
 * @param {string|string[]} opts.recipients - user ID(s)
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} opts.type - 'assignment'|'exam'|'event'|'placement'|'attendance'|'general'
 * @param {string} [opts.refModel] - Mongoose model name for the source doc
 * @param {string} [opts.refId] - ObjectId of the source doc
 * @param {string} [opts.link] - frontend route link
 */
const notify = async (opts) => {
  const { recipients, title, message, type, refModel, refId, link } = opts;
  const recipientArray = Array.isArray(recipients) ? recipients : [recipients];

  const docs = recipientArray.map((userId) => ({
    recipient: userId,
    title,
    message,
    type,
    refModel,
    refId,
    link,
  }));

  await Notification.insertMany(docs);
};

module.exports = { notify };
