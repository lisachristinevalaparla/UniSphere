const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Placement',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeFile: {
      filename: String,
      originalName: String,
      path: String,
    },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected'],
      default: 'applied',
    },
    notes: { type: String }, // admin internal notes
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ placement: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
