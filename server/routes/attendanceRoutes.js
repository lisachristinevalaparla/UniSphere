const express = require('express');
const router = express.Router();
const {
  markAttendance, getMyAttendance, getAllAttendance, getLowAttendance,
} = require('../controllers/attendanceController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

router.get('/my', protect, authorize('student'), getMyAttendance);
router.get('/low', protect, authorize('admin', 'faculty'), getLowAttendance);
router.get('/', protect, authorize('admin', 'faculty'), getAllAttendance);
router.post('/', protect, authorize('admin', 'faculty'), markAttendance);

module.exports = router;
