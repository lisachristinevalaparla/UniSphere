const express = require('express');
const router = express.Router();
const {
  createEvent, getEvents, getEvent, updateEvent, deleteEvent,
  rsvpEvent, joinClub, getMyClubs,
} = require('../controllers/eventController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

router.get('/clubs/my', protect, authorize('student'), getMyClubs);
router.post('/clubs/join', protect, authorize('student'), joinClub);
router.get('/', protect, getEvents);
router.post('/', protect, authorize('admin', 'faculty'), createEvent);
router.get('/:id', protect, getEvent);
router.patch('/:id', protect, authorize('admin', 'faculty'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteEvent);
router.post('/:id/rsvp', protect, authorize('student'), rsvpEvent);

module.exports = router;
