const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['full_time', 'internship', 'part_time', 'contract'],
      default: 'full_time',
    },
    description: { type: String },
    eligibilityCriteria: {
      minCGPA: { type: Number, min: 0, max: 10 },
      departments: [String],
      maxBacklogs: { type: Number, default: 0 },
      minYear: { type: Number },
      maxYear: { type: Number },
    },
    ctc: { type: String }, // e.g. "8-12 LPA"
    location: { type: String },
    lastDateToApply: {
      type: Date,
      required: [true, 'Last date to apply is required'],
    },
    testDate: { type: Date },
    interviewDate: { type: Date },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logo: { type: String },
    status: {
      type: String,
      enum: ['open', 'closed', 'upcoming'],
      default: 'open',
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Placement', placementSchema);
