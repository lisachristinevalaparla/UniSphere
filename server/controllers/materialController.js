const CourseMaterial = require('../models/CourseMaterial');
const User = require('../models/User');
const { notify } = require('../utils/notifyHelper');
const path = require('path');
const fs = require('fs');

// @desc  Upload material (admin)
// @route POST /api/materials
const uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const { title, description, subject, subjectCode, type, tags, targetYear, targetSemester, targetDepartment } = req.body;

    const material = await CourseMaterial.create({
      title,
      description,
      subject,
      subjectCode,
      type,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      targetYear,
      targetSemester,
      targetDepartment,
      uploadedBy: req.user._id,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
    });

    // Notify enrolled students via email
    const query = { role: 'student' };
    if (targetDepartment) query.department = targetDepartment;
    const students = await User.find(query).select('_id');
    const studentIds = students.map((s) => s._id);

    if (studentIds.length) {
      await notify({
        recipients: studentIds,
        title: `New Study Material: ${title}`,
        message: `New verified course material has been uploaded for ${subject || 'your module'}. Access it now on UniSphere.`,
        type: 'material',
        link: '/materials',
        metadata: {
          Subject: subject || 'Academic Course',
          'File Name': req.file.originalname,
          Type: type || 'Notes',
        },
      });
    }

    res.status(201).json({ material });
  } catch (error) {
    next(error);
  }
};

// @desc  Get materials
// @route GET /api/materials
const getMaterials = async (req, res, next) => {
  try {
    const { subject, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (type) filter.type = type;

    const materials = await CourseMaterial.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await CourseMaterial.countDocuments(filter);
    res.json({ materials, total });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single material
// @route GET /api/materials/:id
const getMaterial = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findById(req.params.id).populate('uploadedBy', 'name');
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ material });
  } catch (error) {
    next(error);
  }
};

// @desc  Download material file
// @route GET /api/materials/:id/download
const downloadMaterial = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material || !material.file?.path) {
      return res.status(404).json({ message: 'File not found' });
    }

    material.downloadCount = (material.downloadCount || 0) + 1;
    await material.save();

    const filePath = path.resolve(material.file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, material.file.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete material (admin)
// @route DELETE /api/materials/:id
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    if (material.file?.path && fs.existsSync(material.file.path)) {
      fs.unlinkSync(material.file.path);
    }

    await material.deleteOne();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterial,
  downloadMaterial,
  deleteMaterial,
};
