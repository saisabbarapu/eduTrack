const Review = require("../models/Review");
const Project = require("../models/Project");

const create = async (req, res) => {
  try {
    const { projectId, comments, milestoneName, status, score } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.guideId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only guide can add review" });
    }

    // Auto-calculate score based on status if not provided
    let calculatedScore = score;
    if (calculatedScore === null || calculatedScore === undefined) {
      switch (status) {
        case "approved":
          calculatedScore = 8 + Math.random() * 2; // 8-10 for approved
          break;
        case "corrections":
          calculatedScore = 5 + Math.random() * 2; // 5-7 for corrections
          break;
        case "failed":
          calculatedScore = Math.random() * 4; // 0-4 for failed
          break;
        default:
          calculatedScore = 5; // Default
      }
    }

    const review = await Review.create({
      projectId,
      guideId: req.user._id,
      comments,
      milestoneName: milestoneName || "",
      status: status || "corrections",
      score: Math.round(calculatedScore * 10) / 10, // Round to 1 decimal place
    });

    if (milestoneName) {
      const m = project.milestones.find((x) => x.name === milestoneName);
      if (m) {
        m.status = status || "corrections";
        m.reviewedAt = new Date();
        await project.save();
      }
    }
    res.status(201).json(review);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getByProject = async (req, res) => {
  try {
    const reviews = await Review.find({ projectId: req.params.projectId })
      .populate("guideId", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { create, getByProject };
