const express = require('express');
const router = express.Router();
const { getStudentDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

router.get('/', protect, authorize('student'), getStudentDashboard);
router.get('/admin', protect, authorize('admin', 'faculty'), getAdminDashboard);

module.exports = router;
