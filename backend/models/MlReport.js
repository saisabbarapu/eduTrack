const mongoose = require('mongoose');

const mlReportSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  delayRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  similarityScore: { type: Number, default: 0 },
  duplicateMatches: [{ title: String, score: Number }],
  performanceRisk: { type: String, default: 'low' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MlReport', mlReportSchema);
