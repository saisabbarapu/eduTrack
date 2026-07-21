const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "corrections", "rejected"],
      default: "pending",
    },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    dueDate: { type: Date },
  },
  { _id: true },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    abstract: { type: String, required: true },
    domain: { type: String, required: true },
    techStack: { type: String, default: "" },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Snapshot for quick verification/display (source of truth remains Users collection)
    studentRollNumber: { type: String, default: "" },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guideStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    progressPercent: { type: Number, default: 0 },
    milestones: [milestoneSchema],
    proposalPdf: { type: String, default: "" },
    finalReportPdf: { type: String, default: "" },
    teamMembers: [{ type: String }],
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date, required: true },
    department: { type: String, default: "" },
    batchYear: { type: String, default: "" },
    progressUpdates: [
      {
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    completedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
