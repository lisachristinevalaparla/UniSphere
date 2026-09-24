const Placement = require('../models/Placement');
const Application = require('../models/Application');
const User = require('../models/User');
const { notify } = require('../utils/notifyHelper');

// @desc  Create placement posting (admin)
// @route POST /api/placements
const createPlacement = async (req, res, next) => {
  try {
    const placement = await Placement.create({ ...req.body, postedBy: req.user._id });

    const students = await User.find({ role: 'student' }).select('_id');
    const studentIds = students.map((s) => s._id);
    if (studentIds.length) {
      await notify({
        recipients: studentIds,
        title: `New Placement: ${placement.company}`,
        message: `${placement.company} is hiring for ${placement.role}. Last date: ${new Date(placement.lastDateToApply).toLocaleDateString()}.`,
        type: 'placement',
        refModel: 'Placement',
        refId: placement._id,
        link: '/placements',
      });
    }

    res.status(201).json({ placement });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all placements
// @route GET /api/placements
const getPlacements = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const placements = await Placement.find(filter)
      .populate('postedBy', 'name')
      .sort({ lastDateToApply: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Placement.countDocuments(filter);

    // Attach application status for students
    if (req.user.role === 'student') {
      const ids = placements.map((p) => p._id);
      const applications = await Application.find({
        placement: { $in: ids },
        student: req.user._id,
      }).select('placement status').lean();

      const appMap = {};
      applications.forEach((a) => { appMap[a.placement.toString()] = a; });
      placements.forEach((p) => { p.myApplication = appMap[p._id.toString()] || null; });
    }

    res.json({ placements, total });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single placement
// @route GET /api/placements/:id
const getPlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id).populate('postedBy', 'name email');
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    res.json({ placement });
  } catch (error) {
    next(error);
  }
};

// @desc  Update placement (admin)
// @route PATCH /api/placements/:id
const updatePlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    res.json({ placement });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete placement (admin)
// @route DELETE /api/placements/:id
const deletePlacement = async (req, res, next) => {
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Placement deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Apply to placement (student)
// @route POST /api/placements/:id/apply
const applyToPlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    if (placement.status !== 'open') return res.status(400).json({ message: 'Placement is not open' });

    const student = await User.findById(req.user._id);
    const criteria = placement.eligibilityCriteria;

    if (criteria?.minCGPA && student.cgpa < criteria.minCGPA) {
      return res.status(400).json({ message: `Minimum CGPA required: ${criteria.minCGPA}` });
    }

    const resumeFile = req.file
      ? { filename: req.file.filename, originalName: req.file.originalname, path: req.file.path }
      : null;

    const application = await Application.create({
      placement: req.params.id,
      student: req.user._id,
      coverLetter: req.body.coverLetter,
      resumeFile,
    });

    res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
};

// @desc  Get applications for a placement (admin)
// @route GET /api/placements/:id/applications
const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ placement: req.params.id })
      .populate('student', 'name rollNumber email department year cgpa')
      .sort({ appliedAt: -1 });
    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

// @desc  Update application status (admin)
// @route PATCH /api/placements/:pId/applications/:appId
const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { status: req.body.status, notes: req.body.notes },
      { new: true }
    ).populate('placement', 'company role');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    await notify({
      recipients: application.student,
      title: `Application Update: ${application.placement.company}`,
      message: `Your application status has been updated to: ${req.body.status}.`,
      type: 'placement',
      link: '/placements',
    });

    res.json({ application });
  } catch (error) {
    next(error);
  }
};

// @desc  Get my applications (student)
// @route GET /api/placements/my-applications
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('placement', 'company role type status ctc lastDateToApply')
      .sort({ appliedAt: -1 });
    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlacement, getPlacements, getPlacement, updatePlacement,
  deletePlacement, applyToPlacement, getApplications, updateApplicationStatus, getMyApplications,
};
