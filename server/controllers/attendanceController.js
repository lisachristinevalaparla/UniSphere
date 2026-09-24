const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { notify } = require('../utils/notifyHelper');

// @desc  Mark attendance (admin)
// @route POST /api/attendance
const markAttendance = async (req, res, next) => {
  try {
    let records = req.body.records;
    if (!records && req.body.studentId && req.body.subject) {
      records = [req.body];
    }
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Attendance records data is required' });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: {
          student: r.studentId,
          subject: r.subject,
          date: new Date(r.date),
        },
        update: {
          $set: {
            status: r.status,
            subjectCode: r.subjectCode,
            markedBy: req.user._id,
            notes: r.notes,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    // Notify students marked absent
    const absentRecords = records.filter((r) => r.status === 'absent');
    if (absentRecords.length > 0) {
      for (const r of absentRecords) {
        await notify({
          recipients: r.studentId,
          title: 'Attendance Marked: Absent',
          message: `You were marked absent for ${r.subject} on ${new Date(r.date).toLocaleDateString()}.`,
          type: 'attendance',
          link: '/attendance',
        });
      }
    }

    res.status(200).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get my attendance summary
// @route GET /api/attendance/my
const getMyAttendance = async (req, res, next) => {
  try {
    const summary = await Attendance.getSummaryForStudent(req.user._id);
    const records = await Attendance.find({ student: req.user._id })
      .sort({ date: -1 })
      .limit(60)
      .lean();
    res.json({ summary, records });
  } catch (error) {
    next(error);
  }
};

// @desc  Get attendance records for a subject (admin)
// @route GET /api/attendance
const getAllAttendance = async (req, res, next) => {
  try {
    const { subject, date, studentId } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (date) filter.date = new Date(date);
    if (studentId) filter.student = studentId;

    const records = await Attendance.find(filter)
      .populate('student', 'name rollNumber email')
      .populate('markedBy', 'name')
      .sort({ date: -1 })
      .lean();

    res.json({ records });
  } catch (error) {
    next(error);
  }
};

// @desc  Get low attendance students (admin)
// @route GET /api/attendance/low
const getLowAttendance = async (req, res, next) => {
  try {
    const allStudents = await User.find({ role: 'student' }).select('_id name rollNumber department');
    const results = [];

    for (const student of allStudents) {
      const summary = await Attendance.getSummaryForStudent(student._id);
      const lowSubjects = summary.filter((s) => s.isLow);
      if (lowSubjects.length > 0) {
        results.push({
          student: { _id: student._id, name: student.name, rollNumber: student.rollNumber, department: student.department },
          lowSubjects,
        });
      }
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

module.exports = { markAttendance, getMyAttendance, getAllAttendance, getLowAttendance };
