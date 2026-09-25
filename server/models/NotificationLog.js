const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['otp', 'assignment', 'exam', 'material', 'event', 'placement', 'attendance', 'general'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'simulated'],
      default: 'sent',
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
