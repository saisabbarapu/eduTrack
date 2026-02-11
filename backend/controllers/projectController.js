const Project = require('../models/Project');
const Review = require('../models/Review');
const MlReport = require('../models/MlReport');
const User = require('../models/User');

const create = async (req, res) => {
  try {
    const body = { ...req.body, studentId: req.user._id };
    if (req.files?.proposalPdf?.[0]) body.proposalPdf = req.files.proposalPdf[0].filename;
    try {
      body.milestones = typeof req.body.milestones === 'string' ? JSON.parse(req.body.milestones || '[]') : (Array.isArray(req.body.milestones) ? req.body.milestones : []);
    } catch (_) {
      body.milestones = [];
    }
    try {
      body.teamMembers = typeof req.body.teamMembers === 'string' ? JSON.parse(req.body.teamMembers || '[]') : (Array.isArray(req.body.teamMembers) ? req.body.teamMembers : []);
    } catch (_) {
      body.teamMembers = [];
    }
    body.startDate = body.startDate ? new Date(body.startDate) : new Date();
    body.expectedEndDate = body.expectedEndDate ? new Date(body.expectedEndDate) : new Date();

    // Prefer student profile values (verification + consistency)
    if (!body.department) body.department = req.user.department || '';
    if (!body.batchYear) body.batchYear = req.user.batchYear || '';
    const submittedRoll = typeof req.body.studentRollNumber === 'string' ? req.body.studentRollNumber.trim() : '';
    if (!submittedRoll) return res.status(400).json({ error: 'Roll number is required' });
    if (req.user.rollNumber && req.user.rollNumber.trim() !== submittedRoll) {
      return res.status(400).json({ error: 'Roll number verification failed (does not match your profile)' });
    }
    body.studentRollNumber = submittedRoll;

    // Direct guide tagging during project creation (optional)
    const guideId = typeof req.body.guideId === 'string' ? req.body.guideId.trim() : '';
    if (guideId) {
      const guide = await User.findOne({ _id: guideId, role: 'guide' }).select('_id');
      if (!guide) return res.status(400).json({ error: 'Selected guide not found' });
      body.guideId = guide._id;
      body.guideStatus = 'pending';
    }

    const project = await Project.create(body);
    res.status(201).json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { status, guideStatus, department } = req.query;
    const filter = {};
    if (req.user.role === 'student') filter.studentId = req.user._id;
    if (req.user.role === 'guide') filter.guideId = req.user._id;
    if (guideStatus) filter.guideStatus = guideStatus;
    if (department) filter.department = department;
    const projects = await Project.find(filter)
      .populate('studentId', 'name email rollNumber department batchYear')
      .populate('guideId', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const tagGuide = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      studentId: req.user._id
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.guideStatus === 'accepted') return res.status(400).json({ error: 'Guide already accepted' });
    project.guideId = req.body.guideId;
    project.guideStatus = 'pending';
    await project.save();
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getTaggedForGuide = async (req, res) => {
  try {
    const projects = await Project.find({ guideId: req.user._id, guideStatus: 'pending' })
      .populate('studentId', 'name email rollNumber department batchYear')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getOne = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'name email rollNumber department batchYear')
      .populate('guideId', 'name email');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (req.user.role === 'student' && project.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'guide' && project.guideId?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const reviews = await Review.find({ projectId: project._id }).sort({ createdAt: -1 });
    const mlReport = await MlReport.findOne({ projectId: project._id }).sort({ updatedAt: -1 });
    res.json({ project, reviews, mlReport });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const guideResponse = async (req, res) => {
  try {
    const { accept } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      guideId: req.user._id,
      guideStatus: 'pending'
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.guideStatus = accept ? 'accepted' : 'rejected';
    if (!accept) project.guideId = null;
    await project.save();
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      studentId: req.user._id
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (req.body.progressPercent != null) project.progressPercent = Math.min(100, Math.max(0, req.body.progressPercent));
    if (req.body.progressUpdate) {
      project.progressUpdates.push({ text: req.body.progressUpdate });
    }
    await project.save();
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const mid = req.params.milestoneId;
    const milestone = project.milestones.id(mid);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
    if (req.user.role === 'student') {
      if (project.studentId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });
      milestone.status = 'submitted';
      milestone.submittedAt = new Date();
    } else if (req.user.role === 'guide') {
      if (project.guideId?.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });
      milestone.status = req.body.status || milestone.status;
      milestone.reviewedAt = new Date();
    }
    await project.save();
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Only guide can complete projects
    if (project.guideId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only assigned guide can complete project' });
    }
    
    // Check if all milestones are approved
    const allMilestonesApproved = project.milestones.every(m => m.status === 'approved');
    if (!allMilestonesApproved) {
      return res.status(400).json({ error: 'All milestones must be approved before completing project' });
    }
    
    // Check if final report is uploaded
    if (!project.finalReportPdf) {
      return res.status(400).json({ error: 'Final report must be uploaded before completing project' });
    }
    
    // Mark project as completed
    project.progressPercent = 100;
    project.completedAt = new Date();
    project.guideStatus = 'completed';
    
    await project.save();
    res.json({ 
      message: 'Project completed successfully', 
      project 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const uploadFinalReport = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      studentId: req.user._id
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (req.file) project.finalReportPdf = req.file.filename;
    await project.save();
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const adminStats = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const accepted = await Project.countDocuments({ guideStatus: 'accepted' });
    const pending = await Project.countDocuments({ guideStatus: 'pending' });
    const rejected = await Project.countDocuments({ guideStatus: 'rejected' });
    const deptWise = await Project.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    const guideWise = await Project.aggregate([
      { $match: { guideId: { $ne: null } } },
      { $group: { _id: '$guideId', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'guide' } },
      { $unwind: '$guide' },
      { $project: { _id: 1, count: 1, 'guide.name': 1 } }
    ]);
    const mlReports = await MlReport.find().populate('projectId', 'title');
    const riskCounts = { low: 0, medium: 0, high: 0 };
    mlReports.forEach(r => {
      if (r.delayRisk) riskCounts[r.delayRisk] = (riskCounts[r.delayRisk] || 0) + 1;
    });
    res.json({
      total,
      accepted,
      pending,
      rejected,
      deptWise,
      guideWise,
      riskCounts,
      mlReports: mlReports.slice(0, 20)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  create,
  getAll,
  getTaggedForGuide,
  getOne,
  tagGuide,
  guideResponse,
  updateProgress,
  updateMilestone,
  completeProject,
  uploadFinalReport,
  adminStats
};
