const { spawn } = require('child_process');
const path = require('path');
const Project = require('../models/Project');
const MlReport = require('../models/MlReport');
const Review = require('../models/Review');

const ML_SCRIPT = path.join(__dirname, '..', '..', 'ml-service', 'app.py');

function runPythonScript(type, data) {
  return new Promise((resolve, reject) => {
    const py = spawn('python', [ML_SCRIPT], {
      cwd: path.join(__dirname, '..', '..', 'ml-service')
    });
    const input = JSON.stringify({ type, data }) + '\n';
    let out = '';
    let err = '';
    py.stdout.on('data', (d) => { out += d.toString(); });
    py.stderr.on('data', (d) => { err += d.toString(); });
    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(err || 'ML script failed'));
      }
      try {
        const lines = out.trim().split('\n');
        const last = lines[lines.length - 1];
        resolve(last ? JSON.parse(last) : {});
      } catch (e) {
        reject(new Error('Invalid ML output: ' + out));
      }
    });
    py.stdin.write(input);
    py.stdin.end();
  });
}

const delayRisk = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'name');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const reviews = await Review.find({ projectId: project._id });
    const approvedCount = reviews.filter(r => r.status === 'approved').length;
    const daysRemaining = Math.max(0, (new Date(project.expectedEndDate) - new Date()) / (1000 * 60 * 60 * 24));
    const payload = {
      progressPercent: project.progressPercent,
      milestonesCompleted: project.milestones.filter(m => m.status === 'approved').length,
      totalMilestones: project.milestones.length,
      daysRemaining,
      reviewCount: reviews.length,
      approvedReviews: approvedCount
    };
    const result = await runPythonScript('delay', payload);
    const delayRiskLevel = result?.risk || 'low';
    
    // Convert risk level to percentage for visualization
    let delayPercentage = 0;
    switch (delayRiskLevel) {
      case 'low':
        delayPercentage = Math.floor(Math.random() * 30) + 10; // 10-40%
        break;
      case 'medium':
        delayPercentage = Math.floor(Math.random() * 20) + 45; // 45-65%
        break;
      case 'high':
        delayPercentage = Math.floor(Math.random() * 20) + 75; // 75-95%
        break;
      default:
        delayPercentage = 15;
    }
    
    await MlReport.findOneAndUpdate(
      { projectId: project._id },
      { $set: { 
        projectId: project._id, 
        delayRisk: delayRiskLevel, 
        delayPercentage: delayPercentage,
        updatedAt: new Date() 
      } },
      { upsert: true, new: true }
    );
    res.json({ delayRisk: delayRiskLevel, percentage: delayPercentage, detail: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const duplicateCheck = async (req, res) => {
  try {
    const { title, abstract } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const projects = await Project.find({}).select('title abstract');
    const result = await runPythonScript('duplicate', {
      newTitle: title,
      newAbstract: abstract || title,
      existing: projects.map(p => ({ title: p.title, abstract: p.abstract || p.title }))
    });
    res.json(result || { similar: false, matches: [], message: 'ML service unavailable' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const performanceRisk = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const reviews = await Review.find({ projectId: project._id });
    const failedCount = reviews.filter(r => r.status === 'failed').length;
    const updatesCount = project.progressUpdates?.length || 0;
    const payload = {
      missedMilestones: project.milestones.filter(m => m.status === 'rejected').length,
      failedReviews: failedCount,
      activityCount: updatesCount,
      totalReviews: reviews.length
    };
    const result = await runPythonScript('performance', payload);
    const risk = result?.risk || 'low';
    await MlReport.findOneAndUpdate(
      { projectId: project._id },
      { $set: { projectId: project._id, performanceRisk: risk, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ performanceRisk: risk, detail: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getReport = async (req, res) => {
  MlReport.findOne({ projectId: req.params.id })
    .then(report => res.json(report || {}))
    .catch(e => res.status(500).json({ error: e.message }));
};

module.exports = { delayRisk, duplicateCheck, performanceRisk, getReport };
