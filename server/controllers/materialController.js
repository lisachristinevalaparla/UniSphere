const CourseMaterial = require('../models/CourseMaterial');
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
    if (!material || !material.file) return res.status(404).json({ message: 'File not found' });

    material.downloadCount += 1;
    await material.save();

    res.download(material.file.path, material.file.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete material (admin)
// @route DELETE /api/materials/:id
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    // Optionally delete file from disk
    if (material.file?.path && fs.existsSync(material.file.path)) {
      fs.unlinkSync(material.file.path);
    }
    res.json({ message: 'Material deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadMaterial, getMaterials, getMaterial, downloadMaterial, deleteMaterial };
