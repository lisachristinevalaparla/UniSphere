const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Placement = require('../models/Placement');
const Application = require('../models/Application');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc  Student dashboard aggregate data
// @route GET /api/dashboard
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    // Attendance summary
    const attendanceSummary = await Attendance.getSummaryForStudent(studentId);
    const overallAttendance = attendanceSummary.length
      ? Math.round(attendanceSummary.reduce((acc, s) => acc + s.percentage, 0) / attendanceSummary.length)
      : 0;
    const lowAttendanceSubjects = attendanceSummary.filter((s) => s.isLow);

    // Upcoming assignments (due in future, not submitted)
    const allAssignments = await Assignment.find({ dueDate: { $gte: now }, status: 'active' })
      .sort({ dueDate: 1 })
      .limit(5)
      .lean();

    const mySubmissions = await Submission.find({
      assignment: { $in: allAssignments.map((a) => a._id) },
      student: studentId,
    }).select('assignment status').lean();

    const submittedIds = new Set(mySubmissions.map((s) => s.assignment.toString()));
    const upcomingAssignments = allAssignments.filter((a) => !submittedIds.has(a._id.toString()));

    // Upcoming exams
    const upcomingExams = await Exam.find({ date: { $gte: now }, status: { $in: ['upcoming', 'ongoing'] } })
      .sort({ date: 1 })
      .limit(5)
      .lean();

    // Recent results
    const recentResults = await Result.find({ student: studentId })
      .populate('exam', 'title subject examType')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // My applications
    const myApplications = await Application.find({ student: studentId })
      .populate('placement', 'company role status')
      .sort({ appliedAt: -1 })
      .limit(5)
      .lean();

    // Upcoming events
    const upcomingEvents = await Event.find({ startDate: { $gte: now }, status: { $in: ['upcoming', 'ongoing'] } })
      .sort({ startDate: 1 })
      .limit(4)
      .lean();

    // Unread notifications count
    const unreadNotifications = await Notification.countDocuments({ recipient: studentId, isRead: false });

    // Recent notifications
    const recentNotifications = await Notification.find({ recipient: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      attendance: {
        overall: overallAttendance,
        subjects: attendanceSummary,
        lowCount: lowAttendanceSubjects.length,
        lowSubjects: lowAttendanceSubjects,
      },
      upcomingAssignments,
      upcomingExams,
      recentResults,
      myApplications,
      upcomingEvents,
      notifications: {
        unreadCount: unreadNotifications,
        recent: recentNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin dashboard stats
// @route GET /api/dashboard/admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalAssignments,
      totalExams,
      totalPlacements,
      openPlacements,
      totalApplications,
      pendingSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Assignment.countDocuments(),
      Exam.countDocuments(),
      Placement.countDocuments(),
      Placement.countDocuments({ status: 'open' }),
      Application.countDocuments(),
      Submission.countDocuments({ status: 'submitted' }),
    ]);

    res.json({
      totalStudents,
      totalAssignments,
      totalExams,
      totalPlacements,
      openPlacements,
      totalApplications,
      pendingSubmissions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentDashboard, getAdminDashboard };
