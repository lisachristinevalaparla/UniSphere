const mongoose = require('mongoose');

const clubMembershipSchema = new mongoose.Schema(
  {
    club: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['member', 'secretary', 'president', 'vice_president', 'treasurer'],
      default: 'member',
    },
    joinedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
  },
  { timestamps: true }
);

clubMembershipSchema.index({ club: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ClubMembership', clubMembershipSchema);
