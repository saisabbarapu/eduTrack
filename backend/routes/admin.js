const express = require('express');
const { auth, role } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Review = require('../models/Review');
const MlReport = require('../models/MlReport');

const router = express.Router();

// Get admin dashboard analytics
router.get('/analytics', auth, role('admin'), async (req, res) => {
  try {
    // Get total counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalGuides = await User.countDocuments({ role: 'guide' });
    const totalProjects = await Project.countDocuments();
    const totalMLReports = await MlReport.countDocuments();

    // Projects created per month
    const projectsPerMonth = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, now.getMonth() - i, 1);
      const monthKey = monthDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      projectsPerMonth[monthKey] = 0;
    }

    // Count projects per month
    const projects = await Project.find({
      createdAt: {
        $gte: new Date(currentYear, now.getMonth() - 11, 1)
      }
    });

    projects.forEach(project => {
      const monthKey = project.createdAt.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      if (projectsPerMonth.hasOwnProperty(monthKey)) {
        projectsPerMonth[monthKey]++;
      }
    });

    // Department-wise projects count
    const departmentWise = {};
    const departments = ['CSE', 'IT', 'ECE', 'MCA', 'Others'];
    
    departments.forEach(dept => {
      departmentWise[dept] = 0;
    });

    projects.forEach(project => {
      const dept = project.department || 'Others';
      if (departmentWise.hasOwnProperty(dept)) {
        departmentWise[dept]++;
      } else {
        departmentWise['Others']++;
      }
    });

    // Status distribution
    const statusDistribution = {
      'Active': 0,
      'Completed': 0,
      'Rejected': 0
    };

    projects.forEach(project => {
      if (project.status === 'completed' || project.guideStatus === 'accepted') {
        statusDistribution['Completed']++;
      } else if (project.status === 'rejected' || project.guideStatus === 'rejected') {
        statusDistribution['Rejected']++;
      } else {
        statusDistribution['Active']++;
      }
    });

    // Performance Risk Levels (from ML reports)
    const riskLevels = {
      'Low': 0,
      'Medium': 0,
      'High': 0
    };

    const mlReports = await MlReport.find({});
    mlReports.forEach(report => {
      const delayRisk = report.delayRisk || 'low';
      const performanceRisk = report.performanceRisk || 'low';
      
      // Use the higher risk level between delay and performance
      let riskLevel = 'Low';
      if (delayRisk === 'high' || performanceRisk === 'high') {
        riskLevel = 'High';
      } else if (delayRisk === 'medium' || performanceRisk === 'medium') {
        riskLevel = 'Medium';
      }
      
      riskLevels[riskLevel]++;
    });

    res.json({
      totalStudents,
      totalGuides,
      totalProjects,
      totalMLReports,
      projectsPerMonth,
      departmentWise,
      statusDistribution,
      riskLevels
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
