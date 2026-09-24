const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    subjectCode: { type: String, trim: true },
    type: {
      type: String,
      enum: ['lecture_notes', 'assignment_doc', 'reference', 'lab_manual', 'previous_paper', 'other'],
      default: 'lecture_notes',
    },
    file: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [String],
    targetYear: { type: Number },
    targetSemester: { type: Number },
    targetDepartment: { type: String },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
