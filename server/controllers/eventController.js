const Event = require('../models/Event');
const ClubMembership = require('../models/ClubMembership');
const User = require('../models/User');
const { notify } = require('../utils/notifyHelper');

// @desc  Create event (admin)
// @route POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });

    const students = await User.find({ role: 'student' }).select('_id');
    const studentIds = students.map((s) => s._id);
    if (studentIds.length) {
      await notify({
        recipients: studentIds,
        title: `New Event: ${event.title}`,
        message: `${event.title} is happening on ${new Date(event.startDate).toLocaleDateString()} at ${event.venue || 'TBD'}.`,
        type: 'event',
        refModel: 'Event',
        refId: event._id,
        link: '/events',
      });
    }

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all events
// @route GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('organizer', 'name')
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Event.countDocuments(filter);

    // Mark if current student has RSVPed
    if (req.user.role === 'student') {
      events.forEach((e) => {
        e.hasRSVPed = e.rsvpList.some(
          (r) => r.user && r.user.toString() === req.user._id.toString()
        );
        e.rsvpCount = e.rsvpList.length;
      });
    }

    res.json({ events, total });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single event
// @route GET /api/events/:id
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('rsvpList.user', 'name rollNumber');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc  Update event (admin)
// @route PATCH /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete event (admin)
// @route DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  RSVP to event (student)
// @route POST /api/events/:id/rsvp
const rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const already = event.rsvpList.find((r) => r.user && r.user.toString() === req.user._id.toString());
    if (already) {
      // Toggle: remove RSVP
      event.rsvpList = event.rsvpList.filter((r) => r.user.toString() !== req.user._id.toString());
      await event.save();
      return res.json({ message: 'RSVP removed', hasRSVPed: false, rsvpCount: event.rsvpList.length });
    }

    if (event.maxAttendees && event.rsvpList.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.rsvpList.push({ user: req.user._id });
    await event.save();
    res.json({ message: 'RSVPed successfully', hasRSVPed: true, rsvpCount: event.rsvpList.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Join club (student)
// @route POST /api/events/clubs/join
const joinClub = async (req, res, next) => {
  try {
    const { club } = req.body;
    const membership = await ClubMembership.create({ club, student: req.user._id });
    res.status(201).json({ membership });
  } catch (error) {
    next(error);
  }
};

// @desc  Get my club memberships (student)
// @route GET /api/events/clubs/my
const getMyClubs = async (req, res, next) => {
  try {
    const memberships = await ClubMembership.find({ student: req.user._id }).lean();
    res.json({ memberships });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent, rsvpEvent, joinClub, getMyClubs };
