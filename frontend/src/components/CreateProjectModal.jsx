import React, { useEffect, useState } from "react";
import DuplicateTopicDetectionChart from "./DuplicateTopicDetectionChart.jsx";
import {
  FolderPlus,
  X,
  UploadCloud,
  Zap,
} from "lucide-react";

export default function CreateProjectModal({
  onClose,
  onSubmit,
  onCheckDuplicate,
  duplicateMessage,
  defaultMilestones,
  guides,
  rollNumber,
}) {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    domain: "Web",
    techStack: "",
    startDate: new Date().toISOString().slice(0, 10),
    expectedEndDate: "",
    studentRollNumber: "",
    guideId: "",
    department: "",
    batchYear: "",
    teamMembers: "",
    milestones: defaultMilestones || [],
  });
  const [proposalFile, setProposalFile] = useState(null);
  const [duplicateData, setDuplicateData] = useState(null);
  const [showDuplicateChart, setShowDuplicateChart] = useState(false);

  useEffect(() => {
    if (!rollNumber) return;
    setForm((f) => ({
      ...f,
      studentRollNumber: f.studentRollNumber || rollNumber,
    }));
  }, [rollNumber]);

  useEffect(() => {
    if (form.guideId) return;
    if (Array.isArray(guides) && guides.length > 0) {
      setForm((f) => ({ ...f, guideId: f.guideId || guides[0]._id }));
    }
  }, [guides]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "title" && value.length > 5) {
      onCheckDuplicate(value, form.abstract).then((result) => {
        if (result && result.matches && result.matches.length > 0) {
          setDuplicateData(result);
          setShowDuplicateChart(true);
        } else {
          setDuplicateData(null);
          setShowDuplicateChart(false);
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentRollNumber || !form.studentRollNumber.trim())
      return alert("Please enter your roll number");
    if (!form.guideId) return alert("Please select a guide to tag");
    onSubmit(form, proposalFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="glossy-panel rounded-3xl border border-white/[0.2] shadow-glossy-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.12] flex justify-between items-center sticky top-0 bg-[#080d1a]/90 backdrop-blur-2xl z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-neon-glow">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight drop-shadow-xs">
                Submit Project Proposal
              </h2>
              <p className="text-slate-300 text-xs">
                Fill in project scope, tech stack, and select your faculty guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-glossy-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
              Project Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Autonomous Real-time Drone Navigation with Edge AI"
              required
              className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs"
            />
            {duplicateMessage && (
              <p className="text-[11px] text-amber-300 mt-1 flex items-center gap-1 font-medium">
                <Zap className="w-3 h-3 text-amber-400" />
                {duplicateMessage}
              </p>
            )}
          </div>

          {/* Duplicate Topic Detection Chart */}
          {showDuplicateChart && duplicateData && (
            <div className="glossy-card rounded-2xl p-4 border border-white/[0.12]">
              <DuplicateTopicDetectionChart
                duplicateData={duplicateData}
                title={form.title}
              />
            </div>
          )}

          {/* Abstract */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
              Abstract / Project Summary
            </label>
            <textarea
              name="abstract"
              value={form.abstract}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the research objective, methodology, and expected results..."
              className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs resize-none"
            />
          </div>

          {/* Domain & Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                Domain
              </label>
              <select
                name="domain"
                value={form.domain}
                onChange={handleChange}
                className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs cursor-pointer"
              >
                <option value="Web" className="bg-[#0c1020]">Web Development</option>
                <option value="AI/ML" className="bg-[#0c1020]">Artificial Intelligence & ML</option>
                <option value="IoT" className="bg-[#0c1020]">Internet of Things (IoT)</option>
                <option value="Mobile" className="bg-[#0c1020]">Mobile App Development</option>
                <option value="Cloud" className="bg-[#0c1020]">Cloud & DevOps</option>
                <option value="Other" className="bg-[#0c1020]">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                Tech Stack
              </label>
              <input
                name="techStack"
                value={form.techStack}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Python, TensorFlow"
                className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs"
              />
            </div>
          </div>

          {/* Student Roll Number & Tag Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                Student Roll Number *
              </label>
              <input
                name="studentRollNumber"
                value={form.studentRollNumber}
                onChange={handleChange}
                placeholder="e.g. MCA2026-001"
                required
                className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                Tag Faculty Guide *
              </label>
              <select
                name="guideId"
                value={form.guideId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs cursor-pointer"
              >
                <option value="" className="bg-[#0c1020]">Select Faculty Guide</option>
                {guides.map((g) => (
                  <option key={g._id} value={g._id} className="bg-[#0c1020]">
                    {g.name} ({g.department || "Faculty"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department & Batch Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                Department
              </label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                Batch Year
              </label>
              <input
                name="batchYear"
                value={form.batchYear}
                onChange={handleChange}
                placeholder="e.g. 2026"
                className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs"
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
              Team Members (Comma-separated)
            </label>
            <input
              name="teamMembers"
              value={form.teamMembers}
              onChange={handleChange}
              placeholder="e.g. Alex Morgan, John Doe, Jane Smith"
              className="w-full px-3.5 py-3 rounded-2xl glossy-input text-xs"
            />
          </div>

          {/* Proposal Document Upload */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
              Attach SRS / Proposal PDF (Optional)
            </label>
            <div className="border border-dashed border-white/[0.2] rounded-2xl p-5 text-center hover:border-cyan-400/60 hover:bg-white/[0.04] transition cursor-pointer shadow-glossy-sm backdrop-blur-md">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setProposalFile(e.target.files?.[0])}
                className="hidden"
                id="proposal-upload"
              />
              <label htmlFor="proposal-upload" className="cursor-pointer">
                <UploadCloud className="w-7 h-7 text-cyan-300 mx-auto mb-1" />
                <span className="text-xs text-slate-200 block font-semibold">
                  {proposalFile ? proposalFile.name : "Click to select and upload SRS document"}
                </span>
                <span className="text-[10px] text-slate-400">PDF up to 10MB</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/[0.1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer shadow-glossy-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl glossy-btn-primary text-white text-xs font-bold shadow-neon-glow transition cursor-pointer"
            >
              Submit Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
