const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: { type: String, required: true },
    milestoneName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["approved", "corrections", "failed"],
      required: true,
    },
    score: { type: Number, min: 0, max: 10, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
