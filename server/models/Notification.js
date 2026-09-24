const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['assignment', 'exam', 'event', 'placement', 'attendance', 'material', 'general'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    // Polymorphic reference to source document
    refModel: {
      type: String,
      enum: ['Assignment', 'Exam', 'Event', 'Placement', 'Attendance', 'CourseMaterial'],
    },
    refId: { type: mongoose.Schema.Types.ObjectId },
    link: { type: String }, // frontend route e.g. "/assignments/123"
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
