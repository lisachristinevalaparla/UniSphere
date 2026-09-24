const express = require('express');
const router = express.Router();
const {
  register, login, refresh, logout, getMe, updateProfile, getUsers,
} = require('../controllers/authController');
const protect = require('../middleware/protect');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateProfile);
router.get('/users', protect, getUsers);

module.exports = router;
