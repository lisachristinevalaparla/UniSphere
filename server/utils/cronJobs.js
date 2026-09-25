const cron = require('node-cron');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const NotificationLog = require('../models/NotificationLog');
const { sendNotificationEmail } = require('./emailService');

/**
 * Check for assignments due within the next 24 hours and email students who haven't submitted
 */
const checkUpcomingAssignmentDeadlines = async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAssignments = await Assignment.find({
      deadline: { $gte: now, $lte: in24Hours },
    }).lean();

    for (const assignment of upcomingAssignments) {
      // Find students matching department and year/semester if applicable
      const query = { role: 'student' };
      if (assignment.department) query.department = assignment.department;
      if (assignment.semester) query.semester = assignment.semester;

      const students = await User.find(query).select('_id name email').lean();

      for (const student of students) {
        // Check if student already submitted
        const hasSubmitted = await Submission.exists({
          assignment: assignment._id,
          student: student._id,
        });

        if (!hasSubmitted) {
          // Check if already notified in last 20 hours
          const alreadyNotified = await NotificationLog.exists({
            recipientId: student._id,
            type: 'assignment',
            subject: { $regex: assignment.title, $options: 'i' },
            sentAt: { $gte: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
          });

          if (!alreadyNotified) {
            const hoursLeft = Math.max(1, Math.round((new Date(assignment.deadline) - now) / (1000 * 60 * 60)));
            await sendNotificationEmail({
              to: student.email,
              recipientId: student._id,
              name: student.name,
              subject: `Urgent: Assignment "${assignment.title}" due in ${hoursLeft} hours`,
              title: `Assignment Due Soon (${hoursLeft}h remaining)`,
              message: `Your assignment "${assignment.title}" for ${assignment.subject || 'your course'} is due on ${new Date(assignment.deadline).toLocaleString()}. Please submit your solution before the portal closes.`,
              category: 'assignment',
              actionUrl: `/assignments`,
              actionText: 'Submit Assignment Now',
              metadata: {
                Subject: assignment.subject || 'Academic Course',
                'Max Marks': assignment.maxMarks || 100,
                Deadline: new Date(assignment.deadline).toLocaleString(),
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('⚠️ [Cron] Error checking assignment deadlines:', error.message);
  }
};

/**
 * Check students whose attendance percentage is below 75% threshold
 */
const checkLowAttendanceThreshold = async () => {
  try {
    const students = await User.find({ role: 'student' }).select('_id name email department semester').lean();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const student of students) {
      const records = await Attendance.find({ student: student._id }).lean();
      if (!records || records.length === 0) continue;

      const totalClasses = records.length;
      if (totalClasses < 4) continue; // Skip if too few classes

      const presentClasses = records.filter((r) => r.status === 'present' || r.status === 'late').length;
      const percentage = Math.round((presentClasses / totalClasses) * 100);

      if (percentage < 75) {
        // Check if warned within last 7 days
        const recentWarning = await NotificationLog.exists({
          recipientId: student._id,
          type: 'attendance',
          sentAt: { $gte: oneWeekAgo },
        });

        if (!recentWarning) {
          await sendNotificationEmail({
            to: student.email,
            recipientId: student._id,
            name: student.name,
            subject: `Attendance Alert: Your overall attendance is currently ${percentage}%`,
            title: `Low Attendance Warning (${percentage}%)`,
            message: `Your current attendance is ${percentage}%, which is below the university 75% minimum threshold requirement (${presentClasses}/${totalClasses} sessions attended). Please ensure regular attendance to maintain examination eligibility.`,
            category: 'attendance',
            actionUrl: `/attendance`,
            actionText: 'View Attendance Records',
            metadata: {
              'Current Attendance': `${percentage}%`,
              'Minimum Required': '75%',
              'Attended Sessions': `${presentClasses} of ${totalClasses}`,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('⚠️ [Cron] Error checking low attendance:', error.message);
  }
};

/**
 * Initialize all scheduled background cron jobs
 */
const initCronJobs = () => {
  // Run assignment deadline check every hour (at minute 0)
  cron.schedule('0 * * * *', () => {
    console.log('⏰ [Cron] Running hourly assignment deadline check...');
    checkUpcomingAssignmentDeadlines();
  });

  // Run attendance check every weekday morning at 8:00 AM
  cron.schedule('0 8 * * 1-5', () => {
    console.log('⏰ [Cron] Running daily low attendance threshold check...');
    checkLowAttendanceThreshold();
  });

  console.log('✅ Background cron jobs initialized (Hourly Deadlines, Daily Attendance).');
};

module.exports = {
  initCronJobs,
  checkUpcomingAssignmentDeadlines,
  checkLowAttendanceThreshold,
};
