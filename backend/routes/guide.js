const express = require("express");
const { auth, role } = require("../middleware/auth");
const User = require("../models/User");
const Project = require("../models/Project");
const Review = require("../models/Review");
const MlReport = require("../models/MlReport");

const router = express.Router();
router.use(auth);

// Main Analytics API - Prompt 1
router.get("/analytics/:guideId", auth, role("guide"), async (req, res) => {
  try {
    const { guideId } = req.params;

    // Verify guide is accessing their own data
    if (req.user._id !== guideId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get all projects assigned to this guide
    const projects = await Project.find({ guideId })
      .populate("studentId", "name email rollNumber department")
      .sort({ createdAt: -1 });

    // Get reviews for guide's projects
    const projectIds = projects.map((p) => p._id);
    const reviews = await Review.find({ projectId: { $in: projectIds } })
      .populate("guideId", "name")
      .sort({ createdAt: -1 });

    // Get ML reports for risk assessment
    const mlReports = await MlReport.find({
      projectId: { $in: projectIds },
    });

    // Calculate project status distribution
    const statusDistribution = {
      "Pending Review": projects.filter((p) => p.guideStatus === "pending")
        .length,
      Approved: projects.filter((p) => p.guideStatus === "accepted").length,
      Rejected: projects.filter((p) => p.guideStatus === "rejected").length,
      Completed: projects.filter((p) => p.progressPercent === 100).length,
    };

    // Calculate weekly student submissions (last 8 weeks)
    const weeklySubmissions = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekKey = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const submissions = projects.filter((project) => {
        const progressUpdates = project.progressUpdates || [];
        return progressUpdates.some((update) => {
          const updateDate = new Date(update.createdAt);
          return updateDate >= weekStart && updateDate <= weekEnd;
        });
      }).length;

      weeklySubmissions[weekKey] = submissions;
    }

    // Calculate risk levels from ML reports
    const riskDistribution = {
      Low: 0,
      Medium: 0,
      High: 0,
    };

    mlReports.forEach((report) => {
      const delayRisk = report.delayRisk || "low";
      if (delayRisk === "high") {
        riskDistribution["High"]++;
      } else if (delayRisk === "medium") {
        riskDistribution["Medium"]++;
      } else {
        riskDistribution["Low"]++;
      }
    });

    // Calculate department-wise student distribution
    const departmentDistribution = {};
    projects.forEach((project) => {
      const dept = project.studentId?.department || "Others";
      departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
    });

    res.json({
      statusDistribution,
      weeklySubmissions,
      riskDistribution,
      departmentDistribution,
      totalProjects: projects.length,
      totalReviews: reviews.length,
      totalMLReports: mlReports.length,
    });
  } catch (error) {
    console.error("Guide analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// Review Workload API - Prompt 2
router.get(
  "/review-workload/:guideId",
  auth,
  role("guide"),
  async (req, res) => {
    try {
      const { guideId } = req.params;

      if (req.user._id !== guideId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      const projects = await Project.find({ guideId });
      const projectIds = projects.map((p) => p._id);

      const reviews = await Review.find({ projectId: { $in: projectIds } });

      const workload = projects.map((project) => {
        const projectReviews = reviews.filter(
          (r) => r.projectId.toString() === project._id.toString(),
        );
        const pending = projectReviews.filter(
          (r) => r.status === "corrections" || r.status === "submitted",
        ).length;
        const completed = projectReviews.filter(
          (r) => r.status === "approved" || r.status === "failed",
        ).length;

        return {
          projectTitle: project.title,
          projectName:
            project.title.length > 20
              ? project.title.substring(0, 20) + "..."
              : project.title,
          pending,
          completed,
          total: projectReviews.length,
          status: project.guideStatus,
        };
      });

      res.json(workload);
    } catch (error) {
      console.error("Review workload error:", error);
      res.status(500).json({ error: "Failed to fetch review workload" });
    }
  },
);

// Top Risk Projects API - Prompt 3
router.get("/top-risk/:guideId", auth, role("guide"), async (req, res) => {
  try {
    const { guideId } = req.params;

    if (req.user._id !== guideId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const projects = await Project.find({ guideId })
      .populate("studentId", "name")
      .sort({ createdAt: -1 });

    const projectIds = projects.map((p) => p._id);
    const mlReports = await MlReport.find({ projectId: { $in: projectIds } });

    const riskProjects = projects
      .map((project) => {
        const mlReport = mlReports.find(
          (r) => r.projectId.toString() === project._id.toString(),
        );
        const delayPercentage = mlReport?.delayPercentage || 0;
        const delayRisk = mlReport?.delayRisk || "low";

        let riskLevel = "Low";
        let riskColor = "#22c55e";
        if (delayRisk === "high" || delayPercentage >= 70) {
          riskLevel = "High";
          riskColor = "#ef4444";
        } else if (delayRisk === "medium" || delayPercentage >= 40) {
          riskLevel = "Medium";
          riskColor = "#eab308";
        }

        return {
          projectId: project._id,
          projectTitle: project.title,
          projectName:
            project.title.length > 25
              ? project.title.substring(0, 25) + "..."
              : project.title,
          riskPercentage: delayPercentage,
          riskLevel,
          riskColor,
          studentName: project.studentId?.name || "Unknown",
        };
      })
      .sort((a, b) => b.riskPercentage - a.riskPercentage)
      .slice(0, 5);

    res.json(riskProjects);
  } catch (error) {
    console.error("Top risk projects error:", error);
    res.status(500).json({ error: "Failed to fetch top risk projects" });
  }
});

// Student Performance API - Prompt 4
router.get(
  "/student-performance/:studentId",
  auth,
  role("guide"),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      const projects = await Project.find({ studentId })
        .populate("guideId", "name")
        .sort({ createdAt: -1 });

      const projectIds = projects.map((p) => p._id);
      const reviews = await Review.find({
        projectId: { $in: projectIds },
      }).sort({ createdAt: -1 });

      // Milestones submitted over time
      const milestonesTimeline = [];
      projects.forEach((project) => {
        project.milestones.forEach((milestone) => {
          if (milestone.submittedAt) {
            milestonesTimeline.push({
              date: milestone.submittedAt,
              milestoneName: milestone.name,
              status: milestone.status,
            });
          }
        });
      });

      milestonesTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Review scores per review type
      const reviewScores = {
        "Topic Approval": [],
        Proposal: [],
        "Review-1": [],
        "Review-2": [],
        "Final Submission": [],
      };

      reviews.forEach((review) => {
        if (review.milestoneName && review.score !== null) {
          if (reviewScores[review.milestoneName]) {
            reviewScores[review.milestoneName].push(review.score);
          }
        }
      });

      // Calculate averages for each review type
      const averageScores = {};
      Object.keys(reviewScores).forEach((type) => {
        const scores = reviewScores[type];
        averageScores[type] =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;
      });

      res.json({
        milestonesTimeline,
        reviewScores,
        averageScores,
        totalProjects: projects.length,
        totalReviews: reviews.length,
      });
    } catch (error) {
      console.error("Student performance error:", error);
      res.status(500).json({ error: "Failed to fetch student performance" });
    }
  },
);

// Completion Rate API - Prompt 5
router.get(
  "/completion-rate/:guideId",
  auth,
  role("guide"),
  async (req, res) => {
    try {
      const { guideId } = req.params;

      if (req.user._id !== guideId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      const projects = await Project.find({ guideId });

      const completionData = {
        Completed: projects.filter((p) => p.progressPercent === 100).length,
        "In Progress": projects.filter(
          (p) => p.progressPercent > 0 && p.progressPercent < 100,
        ).length,
        Pending: projects.filter((p) => p.progressPercent === 0).length,
      };

      res.json({
        completionData,
        totalProjects: projects.length,
        completionRate:
          projects.length > 0
            ? (completionData["Completed"] / projects.length) * 100
            : 0,
      });
    } catch (error) {
      console.error("Completion rate error:", error);
      res.status(500).json({ error: "Failed to fetch completion rate" });
    }
  },
);

// Monthly Review Activity API - Prompt 6
router.get(
  "/reviews/monthly/:guideId",
  auth,
  role("guide"),
  async (req, res) => {
    try {
      const { guideId } = req.params;

      if (req.user._id !== guideId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      const projects = await Project.find({ guideId });
      const projectIds = projects.map((p) => p._id);

      // Aggregate reviews by month for the last 12 months
      const monthlyData = await Review.aggregate([
        {
          $match: {
            projectId: { $in: projectIds },
            createdAt: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 11,
                1,
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      // Format data for chart
      const monthlyReviews = {};
      const now = new Date();

      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        monthlyReviews[monthKey] = 0;
      }

      // Fill with actual data
      monthlyData.forEach((item) => {
        const date = new Date(item._id.year, item._id.month - 1, 1);
        const monthKey = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        monthlyReviews[monthKey] = item.count;
      });

      res.json(monthlyReviews);
    } catch (error) {
      console.error("Monthly reviews error:", error);
      res.status(500).json({ error: "Failed to fetch monthly reviews" });
    }
  },
);

// Attention List API - Prompt 7
router.get(
  "/attention-list/:guideId",
  auth,
  role("guide"),
  async (req, res) => {
    try {
      const { guideId } = req.params;

      if (req.user._id !== guideId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      const projects = await Project.find({ guideId })
        .populate("studentId", "name rollNumber department")
        .sort({ createdAt: -1 });

      const projectIds = projects.map((p) => p._id);
      const mlReports = await MlReport.find({ projectId: { $in: projectIds } });

      const attentionStudents = [];

      projects.forEach((project) => {
        let missedUpdates = 0;
        let hasHighRisk = false;

        // Check for missed weekly updates (last 4 weeks)
        const now = new Date();
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - i * 7);
          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const progressUpdates = project.progressUpdates || [];
          const hasUpdate = progressUpdates.some((update) => {
            const updateDate = new Date(update.createdAt);
            return updateDate >= weekStart && updateDate <= weekEnd;
          });

          if (!hasUpdate) {
            missedUpdates++;
          }
        }

        // Check for high delay risk
        const mlReport = mlReports.find(
          (r) => r.projectId.toString() === project._id.toString(),
        );
        if (
          mlReport &&
          (mlReport.delayRisk === "high" || mlReport.delayPercentage >= 70)
        ) {
          hasHighRisk = true;
        }

        // Add to attention list if missed updates or high risk
        if (missedUpdates > 0 || hasHighRisk) {
          attentionStudents.push({
            studentId: project.studentId._id,
            studentName: project.studentId.name,
            rollNumber: project.studentId.rollNumber,
            department: project.studentId.department,
            projectTitle: project.title,
            missedUpdates,
            hasHighRisk,
            riskPercentage: mlReport?.delayPercentage || 0,
            lastUpdate:
              project.progressUpdates?.length > 0
                ? project.progressUpdates[project.progressUpdates.length - 1]
                    .createdAt
                : project.createdAt,
          });
        }
      });

      // Sort by missed updates (descending) then by risk
      attentionStudents.sort((a, b) => {
        if (b.missedUpdates !== a.missedUpdates) {
          return b.missedUpdates - a.missedUpdates;
        }
        return b.riskPercentage - a.riskPercentage;
      });

      res.json(attentionStudents);
    } catch (error) {
      console.error("Attention list error:", error);
      res.status(500).json({ error: "Failed to fetch attention list" });
    }
  },
);

module.exports = router;
