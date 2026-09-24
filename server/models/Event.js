const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String },
    category: {
      type: String,
      enum: ['academic', 'cultural', 'sports', 'technical', 'club', 'placement', 'other'],
      default: 'other',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: { type: Date },
    venue: { type: String, trim: true },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImage: { type: String },
    rsvpList: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rsvpedAt: { type: Date, default: Date.now },
      },
    ],
    maxAttendees: { type: Number },
    isPublic: { type: Boolean, default: true },
    tags: [String],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
