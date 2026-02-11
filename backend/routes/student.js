const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Review = require('../models/Review');
const User = require('../models/User');
const { auth, role } = require('../middleware/auth');

// Get student dashboard data
router.get('/dashboard/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get all projects for the student
    const projects = await Project.find({ studentId })
      .populate('guideId', 'name email')
      .sort({ createdAt: -1 });

    // Get all reviews for student's projects
    const projectIds = projects.map(p => p._id);
    const reviews = await Review.find({ projectId: { $in: projectIds } })
      .populate('guideId', 'name')
      .sort({ createdAt: -1 });

    // Calculate project status distribution
    const statusDistribution = {
      'Not Started': 0,
      'In Progress': 0,
      'Completed': 0
    };

    projects.forEach(project => {
      if (project.progressPercent === 0) {
        statusDistribution['Not Started']++;
      } else if (project.progressPercent < 100) {
        statusDistribution['In Progress']++;
      } else {
        statusDistribution['Completed']++;
      }
    });

    // Calculate weekly progress updates (based on milestones submitted per week)
    const weeklyProgress = {};
    const now = new Date();
    const weeksBack = 12; // Show last 12 weeks
    
    for (let i = weeksBack - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekKey = `Week ${weeksBack - i}`;
      weeklyProgress[weekKey] = 0;
      
      projects.forEach(project => {
        project.milestones.forEach(milestone => {
          if (milestone.submittedAt) {
            const submittedDate = new Date(milestone.submittedAt);
            if (submittedDate >= weekStart && submittedDate <= weekEnd) {
              weeklyProgress[weekKey]++;
            }
          }
        });
      });
    }

    // Calculate review scores (using status as score approximation)
    const reviewScores = [];
    reviews.forEach(review => {
      let score = 5; // Default neutral score
      
      // Convert status to score (approved = 8-10, corrections = 5-7, failed = 0-4)
      if (review.status === 'approved') {
        score = 9; // High score for approved
      } else if (review.status === 'corrections') {
        score = 6; // Medium score for corrections needed
      } else if (review.status === 'failed') {
        score = 3; // Low score for failed
      }
      
      reviewScores.push({
        score: score,
        guideName: review.guideId?.name || 'Unknown Guide',
        date: review.createdAt,
        milestoneName: review.milestoneName || 'General Review'
      });
    });

    res.json({
      statusDistribution,
      weeklyProgress,
      reviewScores: reviewScores.slice(0, 10), // Last 10 reviews
      totalProjects: projects.length,
      completedProjects: statusDistribution['Completed'],
      averageProgress: projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + p.progressPercent, 0) / projects.length)
        : 0
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get guide dashboard data
router.get('/guide/dashboard/:guideId', auth, async (req, res) => {
  try {
    const { guideId } = req.params;
    
    // Get all projects assigned to this guide
    const projects = await Project.find({ guideId })
      .populate('studentId', 'name email rollNumber')
      .sort({ createdAt: -1 });

    // Get all reviews for guide's projects
    const projectIds = projects.map(p => p._id);
    const reviews = await Review.find({ projectId: { $in: projectIds } })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    // Calculate project status distribution for guide
    const projectStatusDistribution = {
      'Pending Review': 0,
      'Approved': 0,
      'Rejected': 0
    };

    projects.forEach(project => {
      if (project.guideStatus === 'pending') {
        projectStatusDistribution['Pending Review']++;
      } else if (project.guideStatus === 'accepted') {
        projectStatusDistribution['Approved']++;
      } else if (project.guideStatus === 'rejected') {
        projectStatusDistribution['Rejected']++;
      }
    });

    // Calculate review workload distribution based on project risk
    const riskDistribution = {
      'Low Risk': 0,
      'Medium Risk': 0,
      'High Risk': 0
    };

    projects.forEach(project => {
      // Simple risk calculation based on progress and milestones
      const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
      const totalMilestones = project.milestones.length;
      const progressRatio = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;
      
      // Risk assessment based on progress and time
      const daysSinceStart = Math.floor((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
      const expectedDuration = Math.floor((new Date(project.expectedEndDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
      const timeRatio = expectedDuration > 0 ? daysSinceStart / expectedDuration : 0;
      
      // Calculate risk score
      let riskScore = 0;
      if (progressRatio < 0.3 && timeRatio > 0.5) riskScore = 3; // High risk
      else if (progressRatio < 0.6 && timeRatio > 0.7) riskScore = 2; // Medium risk
      else riskScore = 1; // Low risk
      
      if (riskScore === 3) riskDistribution['High Risk']++;
      else if (riskScore === 2) riskDistribution['Medium Risk']++;
      else riskDistribution['Low Risk']++;
    });

    // Calculate weekly submission trend
    const weeklySubmissions = {};
    const now = new Date();
    const weeksBack = 12;
    
    for (let i = weeksBack - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekKey = `Week ${weeksBack - i}`;
      weeklySubmissions[weekKey] = 0;
      
      // Count milestone submissions in this week
      projects.forEach(project => {
        project.milestones.forEach(milestone => {
          if (milestone.submittedAt) {
            const submittedDate = new Date(milestone.submittedAt);
            if (submittedDate >= weekStart && submittedDate <= weekEnd) {
              weeklySubmissions[weekKey]++;
            }
          }
        });
      });
    }

    res.json({
      projectStatusDistribution,
      riskDistribution,
      weeklySubmissions,
      totalProjects: projects.length,
      pendingReviews: projectStatusDistribution['Pending Review'],
      averageProgress: projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + p.progressPercent, 0) / projects.length)
        : 0
    });

  } catch (error) {
    console.error('Guide dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch guide dashboard data' });
  }
});

// Get admin analytics data
router.get('/admin/analytics', auth, async (req, res) => {
  try {
    // Get all projects with populated data
    const projects = await Project.find({})
      .populate('studentId', 'name department')
      .populate('guideId', 'name')
      .sort({ createdAt: -1 });

    // Get ML reports for risk analysis
    const MlReport = require('../models/MlReport');
    const mlReports = await MlReport.find({}).populate('projectId', 'title');

    // 1. Total projects created per month (Line Chart)
    const monthlyProjects = {};
    const now = new Date();
    const monthsBack = 12;
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyProjects[monthKey] = 0;
    }

    projects.forEach(project => {
      const projectMonth = new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyProjects.hasOwnProperty(projectMonth)) {
        monthlyProjects[projectMonth]++;
      }
    });

    // 2. Department-wise projects count (Bar Chart)
    const departmentProjects = {};
    projects.forEach(project => {
      const dept = project.department || 'Unknown';
      departmentProjects[dept] = (departmentProjects[dept] || 0) + 1;
    });

    // 3. Status distribution (Doughnut Chart)
    const statusDistribution = {
      'Active': 0,
      'Completed': 0,
      'Rejected': 0
    };

    projects.forEach(project => {
      if (project.guideStatus === 'completed') {
        statusDistribution['Completed']++;
      } else if (project.guideStatus === 'rejected') {
        statusDistribution['Rejected']++;
      } else {
        statusDistribution['Active']++;
      }
    });

    // 4. Performance Risk Level (Radar Chart)
    const riskLevels = {
      'Low Risk': 0,
      'Medium Risk': 0,
      'High Risk': 0
    };

    // Use ML reports if available, otherwise calculate based on project data
    if (mlReports.length > 0) {
      mlReports.forEach(report => {
        if (report.delayRisk) {
          const riskKey = report.delayRisk.charAt(0).toUpperCase() + report.delayRisk.slice(1) + ' Risk';
          if (riskLevels.hasOwnProperty(riskKey)) {
            riskLevels[riskKey]++;
          }
        }
      });
    } else {
      // Fallback: Calculate risk based on project progress and timeline
      projects.forEach(project => {
        const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
        const totalMilestones = project.milestones.length;
        const progressRatio = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;
        
        const daysSinceStart = Math.floor((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
        const expectedDuration = Math.floor((new Date(project.expectedEndDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
        const timeRatio = expectedDuration > 0 ? daysSinceStart / expectedDuration : 0;
        
        let riskScore = 0;
        if (progressRatio < 0.3 && timeRatio > 0.5) riskScore = 3;
        else if (progressRatio < 0.6 && timeRatio > 0.7) riskScore = 2;
        else riskScore = 1;
        
        if (riskScore === 3) riskLevels['High Risk']++;
        else if (riskScore === 2) riskLevels['Medium Risk']++;
        else riskLevels['Low Risk']++;
      });
    }

    // Additional analytics
    const totalStudents = await require('../models/User').countDocuments({ role: 'student' });
    const totalGuides = await require('../models/User').countDocuments({ role: 'guide' });
    const avgProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progressPercent, 0) / projects.length)
      : 0;

    res.json({
      monthlyProjects,
      departmentProjects,
      statusDistribution,
      riskLevels,
      summary: {
        totalProjects: projects.length,
        totalStudents,
        totalGuides,
        avgProgress,
        completedProjects: statusDistribution['Completed'],
        activeProjects: statusDistribution['Active']
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch admin analytics data' });
  }
});

// Get student dashboard analytics with charts data
router.get('/dashboard/:studentId/analytics', auth, role('student'), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verify student is accessing their own data
    if (req.user._id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get student's projects
    const projects = await Project.find({ studentId })
      .populate('guideId', 'name email')
      .sort({ createdAt: -1 });

    // Get reviews for student's projects
    const Review = require('../models/Review');
    const projectIds = projects.map(p => p._id);
    const reviews = await Review.find({ projectId: { $in: projectIds } })
      .populate('guideId', 'name')
      .sort({ createdAt: -1 });

    // Calculate project status distribution
    const statusDistribution = {
      'Not Started': projects.filter(p => p.progressPercent === 0).length,
      'In Progress': projects.filter(p => p.progressPercent > 0 && p.progressPercent < 100).length,
      'Completed': projects.filter(p => p.progressPercent === 100).length
    };

    // Calculate weekly progress updates (based on milestones)
    const weeklyUpdates = {};
    projects.forEach(project => {
      if (project.progressUpdates && project.progressUpdates.length > 0) {
        project.progressUpdates.forEach(update => {
          const week = new Date(update.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          weeklyUpdates[week] = (weeklyUpdates[week] || 0) + 1;
        });
      }
    });

    // Calculate review scores distribution
    const reviewScores = reviews.map(review => ({
      score: review.score || 0,
      date: review.createdAt,
      projectTitle: projects.find(p => p._id.toString() === review.projectId.toString())?.title || 'Unknown',
      guideName: review.guideId?.name || 'Unknown'
    }));

    res.json({
      statusDistribution,
      weeklyUpdates,
      reviewScores,
      totalProjects: projects.length,
      totalReviews: reviews.length
    });

  } catch (error) {
    console.error('Student dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Admin analytics endpoint
router.get('/admin/analytics', auth, role('admin'), async (req, res) => {
  try {
    console.log('Admin analytics request received');
    console.log('Request user:', req.user);
    console.log('Request user role:', req.user?.role);
    
    if (!req.user || req.user.role !== 'admin') {
      console.log('Access denied - user is not admin');
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    // Get all users
    const students = await User.find({ role: 'student' }).countDocuments();
    const guides = await User.find({ role: 'guide' }).countDocuments();
    
    console.log('Students count:', students);
    console.log('Guides count:', guides);
    
    // Get all projects
    const projects = await Project.find({})
      .populate('studentId', 'name email department')
      .populate('guideId', 'name email')
      .sort({ createdAt: -1 });

    console.log('Projects count:', projects.length);

    // Calculate projects per month
    const projectsPerMonth = {};
    projects.forEach(project => {
      const month = new Date(project.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      projectsPerMonth[month] = (projectsPerMonth[month] || 0) + 1;
    });

    // Department-wise projects count
    const departmentWise = {};
    projects.forEach(project => {
      const dept = project.department || 'Unknown';
      departmentWise[dept] = (departmentWise[dept] || 0) + 1;
    });

    // Status distribution
    const statusDistribution = {
      'Active': projects.filter(p => p.guideStatus === 'accepted' || p.guideStatus === 'pending').length,
      'Completed': projects.filter(p => p.guideStatus === 'completed').length,
      'Rejected': projects.filter(p => p.guideStatus === 'rejected').length
    };

    // Performance risk levels (from ML reports)
    const MlReport = require('../models/MlReport');
    const mlReports = await MlReport.find({});
    console.log('ML Reports count:', mlReports.length);
    
    const riskLevels = {
      'Low': 0,
      'Medium': 0,
      'High': 0
    };

    mlReports.forEach(report => {
      const delayRisk = report.delayRisk || 'low';
      const performanceRisk = report.performanceRisk || 'low';
      
      // Combine risks for overall assessment
      if (delayRisk === 'high' || performanceRisk === 'high') {
        riskLevels['High']++;
      } else if (delayRisk === 'medium' || performanceRisk === 'medium') {
        riskLevels['Medium']++;
      } else {
        riskLevels['Low']++;
      }
    });

    const responseData = {
      totalStudents: students,
      totalGuides: guides,
      totalProjects: projects.length,
      projectsPerMonth,
      departmentWise,
      statusDistribution,
      riskLevels,
      totalMLReports: mlReports.length
    };

    console.log('Admin analytics response:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
