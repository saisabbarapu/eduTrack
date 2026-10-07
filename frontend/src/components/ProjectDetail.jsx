import React, { useState, useEffect } from "react";
import api from "../api";
import ProjectTimelineChart from "./ProjectTimelineChart.jsx";
import ReviewScoreHistoryChart from "./ReviewScoreHistoryChart.jsx";
import {
  X,
  FileText,
  Clock,
  Send,
  Upload,
  Bot,
  Award,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ProjectDetail({ projectId, role, onClose, onRefresh }) {
  const [data, setData] = useState(null);
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState("");
  const [progressUpdate, setProgressUpdate] = useState("");
  const [progressPercent, setProgressPercent] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMilestone, setReviewMilestone] = useState("");
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [delayRisk, setDelayRisk] = useState(null);
  const [finalReportFile, setFinalReportFile] = useState(null);

  useEffect(() => {
    api.get(`/projects/${projectId}`).then((res) => setData(res.data));
    if (role === "student")
      api.get("/users/guides").then((res) => setGuides(res.data));
  }, [projectId, role]);

  if (!data)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin" />
      </div>
    );

  const { project } = data;

  const handleTagGuide = () => {
    if (!selectedGuide) return alert("Select a guide");
    api
      .patch(`/projects/${projectId}/tag-guide`, { guideId: selectedGuide })
      .then(() => {
        onRefresh();
        api.get(`/projects/${projectId}`).then((r) => setData(r.data));
      })
      .catch((e) => alert(e.response?.data?.error || "Failed"));
  };

  const handleProgressSubmit = () => {
    const body = {};
    if (progressUpdate) body.progressUpdate = progressUpdate;
    if (progressPercent !== "") body.progressPercent = Number(progressPercent);
    api
      .patch(`/projects/${projectId}/progress`, body)
      .then(() => {
        setProgressUpdate("");
        setProgressPercent("");
        onRefresh();
        api.get(`/projects/${projectId}`).then((r) => setData(r.data));
      })
      .catch((e) => alert(e.response?.data?.error || "Failed"));
  };

  const handleSubmitMilestone = (milestoneId) => {
    api
      .patch(`/projects/${projectId}/milestones/${milestoneId}`, {})
      .then(() => {
        onRefresh();
        api.get(`/projects/${projectId}`).then((r) => setData(r.data));
      })
      .catch((e) => alert(e.response?.data?.error || "Failed"));
  };

  const handleGuideApproveMilestone = (milestoneId, status) => {
    api
      .patch(`/projects/${projectId}/milestones/${milestoneId}`, { status })
      .then(() => {
        onRefresh();
        api.get(`/projects/${projectId}`).then((r) => setData(r.data));
      })
      .catch((e) => alert(e.response?.data?.error || "Failed"));
  };

  const handleAddReview = () => {
    api
      .post("/reviews", {
        projectId,
        comments: reviewComment,
        milestoneName: reviewMilestone,
        status: reviewStatus,
      })
      .then(() => {
        setReviewComment("");
        setReviewMilestone("");
        onRefresh();
        return api.get(`/projects/${projectId}`);
      })
      .then((res) => setData(res.data))
      .catch((e) => alert(e.response?.data?.error || "Failed"));
  };

  const fetchDelayRisk = () => {
    api
      .get(`/ml/delay-risk/${projectId}`)
      .then((res) => setDelayRisk(res.data))
      .catch(() => setDelayRisk({ delayRisk: "error" }));
  };

  const handleFinalReportUpload = () => {
    if (!finalReportFile) return alert("Select a PDF");
    const fd = new FormData();
    fd.append("finalReportPdf", finalReportFile);
    api
      .post(`/projects/${projectId}/final-report`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setFinalReportFile(null);
        onRefresh();
        api.get(`/projects/${projectId}`).then((r) => setData(r.data));
      })
      .catch((e) => alert(e.response?.data?.error || "Failed"));
  };

  const proposalUrl = project.proposalPdf
    ? `/uploads/${project.proposalPdf}`
    : null;
  const finalUrl = project.finalReportPdf
    ? `/uploads/${project.finalReportPdf}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg overflow-y-auto">
      <div className="glossy-panel rounded-3xl border border-white/[0.2] shadow-glossy-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative my-8">
        {/* Modal Sticky Header */}
        <div className="p-5 border-b border-white/[0.12] flex justify-between items-center sticky top-0 bg-[#0c1224]/95 backdrop-blur-2xl z-20">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-neon-glow">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white tracking-tight truncate drop-shadow-xs">
                {project.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-cyan-300 font-semibold">{project.domain || "Web"}</span>
                <span>•</span>
                <span>{project.techStack || "General Stack"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer shadow-glossy-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Abstract Box */}
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 border border-white/[0.1] space-y-1.5 shadow-glossy-sm">
            <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider block">Project Abstract</span>
            <p className="text-slate-200 text-xs leading-relaxed">{project.abstract}</p>
          </div>

          {/* Quick Meta Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-3 shadow-glossy-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Domain</span>
              <span className="font-bold text-white">{project.domain}</span>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-3 shadow-glossy-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Progress</span>
              <span className="font-bold text-cyan-300">{project.progressPercent}%</span>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-3 shadow-glossy-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student</span>
              <span className="font-bold text-white truncate block">{project.studentId?.name || "N/A"}</span>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-3 shadow-glossy-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Guide Status</span>
              <span className="font-bold text-emerald-300 capitalize">{project.guideStatus}</span>
            </div>
          </div>

          {/* Documents Download Pills */}
          {(proposalUrl || finalUrl) && (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {proposalUrl && (
                <a
                  href={proposalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/25 text-xs font-semibold flex items-center gap-2 transition shadow-neon-glow"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Proposal Document</span>
                  <ExternalLink className="w-3 h-3 text-cyan-300/70" />
                </a>
              )}
              {finalUrl && (
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25 text-xs font-semibold flex items-center gap-2 transition shadow-neon-emerald"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Final Report Document</span>
                  <ExternalLink className="w-3 h-3 text-emerald-300/70" />
                </a>
              )}
            </div>
          )}

          {/* Student: Tag guide prompt */}
          {role === "student" &&
            project.guideStatus === "pending" &&
            project.guideId && (
              <div className="border border-amber-400/40 rounded-2xl p-4 bg-amber-500/15 text-amber-200 text-xs flex items-center gap-2.5 shadow-glossy-sm">
                <Clock className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
                <span>Waiting for guide approval from <strong>{project.guideId.name}</strong>.</span>
              </div>
            )}

          {role === "student" &&
            project.guideStatus !== "accepted" &&
            !project.guideId && (
              <div className="glossy-card rounded-2xl p-4 border border-white/[0.12] space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tag Faculty Guide</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedGuide}
                    onChange={(e) => setSelectedGuide(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl glossy-input text-xs"
                  >
                    <option value="" className="bg-[#0c1020]">Select Faculty Guide</option>
                    {guides.map((g) => (
                      <option key={g._id} value={g._id} className="bg-[#0c1020]">
                        {g.name} ({g.department}) — {g.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleTagGuide}
                    className="px-4 py-2 rounded-xl glossy-btn-primary text-white text-xs font-bold shadow-neon-glow cursor-pointer"
                  >
                    Tag Guide
                  </button>
                </div>
              </div>
            )}

          {/* Guide: Accept / Reject Buttons */}
          {role === "guide" && project.guideStatus === "pending" && (
            <div className="bg-amber-500/15 backdrop-blur-md rounded-2xl p-4 border border-amber-400/40 flex items-center justify-between gap-3 shadow-glossy-sm">
              <div>
                <h4 className="text-xs font-bold text-amber-200">Pending Mentorship Request</h4>
                <p className="text-[11px] text-slate-300">Accept to mentor and review milestones for this project.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    api
                      .patch(`/projects/${projectId}/guide-response`, {
                        accept: true,
                      })
                      .then(() => {
                        onRefresh();
                        api
                          .get(`/projects/${projectId}`)
                          .then((r) => setData(r.data));
                      })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-neon-emerald cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    api
                      .patch(`/projects/${projectId}/guide-response`, {
                        accept: false,
                      })
                      .then(() => {
                        onRefresh();
                        api
                          .get(`/projects/${projectId}`)
                          .then((r) => setData(r.data));
                      })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Student Progress Update Box */}
          {role === "student" && project.guideStatus === "accepted" && (
            <div className="glossy-card rounded-2xl p-4 border border-white/[0.12] space-y-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-300" /> Log Weekly Sprint Progress
              </h3>
              <textarea
                value={progressUpdate}
                onChange={(e) => setProgressUpdate(e.target.value)}
                placeholder="Describe key features implemented this week..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl glossy-input text-xs resize-none"
              />
              <div className="flex items-center gap-2.5">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(e.target.value)}
                  placeholder="Progress %"
                  className="w-28 px-3 py-1.5 rounded-xl glossy-input text-xs"
                />
                <button
                  onClick={handleProgressSubmit}
                  className="px-4 py-2 rounded-xl glossy-btn-primary text-white text-xs font-bold shadow-neon-glow cursor-pointer"
                >
                  Submit Update
                </button>
              </div>
            </div>
          )}

          {/* Timeline Chart */}
          <div className="glossy-card rounded-2xl p-4 border border-white/[0.12]">
            <ProjectTimelineChart project={project} height={300} />
          </div>

          {/* Milestones List */}
          <div className="glossy-card rounded-2xl p-4 border border-white/[0.12] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Milestones</h3>
            <ul className="space-y-2">
              {(project.milestones || []).map((m) => (
                <li
                  key={m._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] gap-2 shadow-glossy-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${m.status === "approved" ? "text-emerald-300" : "text-slate-500"}`} />
                    <span className="text-xs font-semibold text-slate-200">{m.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        m.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                          : m.status === "submitted"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                            : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {role === "student" && m.status === "pending" && (
                    <button
                      onClick={() => handleSubmitMilestone(m._id)}
                      className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold self-start sm:self-auto cursor-pointer shadow-neon-glow"
                    >
                      Submit
                    </button>
                  )}

                  {role === "guide" && m.status === "submitted" && (
                    <div className="flex gap-1.5 self-start sm:self-auto">
                      <button
                        onClick={() =>
                          handleGuideApproveMilestone(m._id, "approved")
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleGuideApproveMilestone(m._id, "corrections")
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                      >
                        Corrections
                      </button>
                      <button
                        onClick={() =>
                          handleGuideApproveMilestone(m._id, "rejected")
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Guide Review Form */}
          {role === "guide" && project.guideStatus === "accepted" && (
            <div className="glossy-card rounded-2xl p-4 border border-white/[0.12] space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-300" /> Add Review Feedback
              </h3>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Faculty review comments & score guidance..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl glossy-input text-xs resize-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <select
                  value={reviewMilestone}
                  onChange={(e) => setReviewMilestone(e.target.value)}
                  className="px-3 py-2 rounded-xl glossy-input text-xs cursor-pointer"
                >
                  <option value="" className="bg-[#0c1020]">General Feedback</option>
                  {(project.milestones || []).map((m) => (
                    <option key={m._id} value={m.name} className="bg-[#0c1020]">
                      {m.name}
                    </option>
                  ))}
                </select>

                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl glossy-input text-xs cursor-pointer"
                >
                  <option value="approved" className="bg-[#0c1020]">Approved</option>
                  <option value="corrections" className="bg-[#0c1020]">Corrections Needed</option>
                  <option value="failed" className="bg-[#0c1020]">Failed</option>
                </select>
              </div>

              <button
                onClick={handleAddReview}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-neon-purple cursor-pointer"
              >
                Submit Faculty Review
              </button>
            </div>
          )}

          {/* Review Score History Chart */}
          <div className="glossy-card rounded-2xl p-4 border border-white/[0.12]">
            <ReviewScoreHistoryChart projectId={projectId} height={280} />
          </div>

          {/* Student: Final Report Upload */}
          {role === "student" && project.guideStatus === "accepted" && (
            <div className="glossy-card rounded-2xl p-4 border border-white/[0.12] space-y-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-cyan-300" /> Upload Final Capstone Report (PDF)
              </h3>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFinalReportFile(e.target.files?.[0])}
                className="text-xs text-slate-300 block"
              />
              <button
                onClick={handleFinalReportUpload}
                className="px-4 py-2 rounded-xl glossy-btn-primary text-white text-xs font-bold shadow-neon-glow cursor-pointer"
              >
                Upload Final Report
              </button>
            </div>
          )}

          {/* ML Delay Risk Section */}
          {role === "student" && (
            <div className="glossy-card rounded-2xl p-4 border border-white/[0.12] space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-300" /> AI Delay Risk Prediction
              </h3>
              {delayRisk === null ? (
                <button
                  onClick={fetchDelayRisk}
                  className="px-4 py-2 rounded-xl glossy-btn-primary text-white text-xs font-bold shadow-neon-glow cursor-pointer"
                >
                  Analyze ML Risk
                </button>
              ) : delayRisk.delayRisk === "error" ? (
                <p className="text-amber-300 text-xs">
                  ML service unavailable. Make sure backend ML services are active.
                </p>
              ) : (
                <p
                  className={`text-xs font-semibold ${
                    delayRisk.delayRisk === "high"
                      ? "text-rose-300"
                      : delayRisk.delayRisk === "medium"
                        ? "text-amber-300"
                        : "text-emerald-300"
                  }`}
                >
                  Risk Assessment: {delayRisk.delayRisk?.toUpperCase()} — {delayRisk.detail?.message || ""}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
