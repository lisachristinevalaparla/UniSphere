const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    subjectCode: { type: String, trim: true },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    totalMarks: { type: Number, default: 100 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Target audience
    targetYear: { type: Number },
    targetSemester: { type: Number },
    targetDepartment: { type: String },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        path: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
