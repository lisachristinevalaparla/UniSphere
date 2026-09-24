const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    subjectCode: { type: String, trim: true },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound index: one record per student per subject per date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

/**
 * Static: get attendance summary per subject for a student
 */
attendanceSchema.statics.getSummaryForStudent = async function (studentId) {
  return this.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: { subject: '$subject', subjectCode: '$subjectCode' },
        total: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        subject: '$_id.subject',
        subjectCode: '$_id.subjectCode',
        total: 1,
        present: 1,
        percentage: {
          $round: [
            { $multiply: [{ $divide: ['$present', '$total'] }, 100] },
            1,
          ],
        },
        isLow: {
          $lt: [{ $divide: ['$present', '$total'] }, 0.75],
        },
      },
    },
    { $sort: { subject: 1 } },
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema);
