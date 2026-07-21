import React, { useState, useEffect } from "react";
import api from "../api";
import ProjectTimelineChart from "./ProjectTimelineChart.jsx";
import ReviewScoreHistoryChart from "./ReviewScoreHistoryChart.jsx";

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
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500" />
      </div>
    );

  const { project, reviews, mlReport } = data;

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

  const handleCompleteProject = () => {
    if (
      !confirm(
        "Are you sure you want to mark this project as completed? This action cannot be undone.",
      )
    )
      return;
    api
      .patch(`/projects/${projectId}/complete`)
      .then((res) => {
        alert(res.data.message || "Project completed successfully!");
        onRefresh();
        api.get(`/projects/${projectId}`).then((r) => setData(r.data));
      })
      .catch((e) =>
        alert(e.response?.data?.error || "Failed to complete project"),
      );
  };

  const proposalUrl = project.proposalPdf
    ? `/uploads/${project.proposalPdf}`
    : null;
  const finalUrl = project.finalReportPdf
    ? `/uploads/${project.finalReportPdf}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <h2 className="font-display text-xl font-semibold text-white truncate pr-4">
            {project.title}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-slate-300">{project.abstract}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-slate-500">Domain:</span>
            <span className="text-white">{project.domain}</span>
            <span className="text-slate-500">Tech:</span>
            <span className="text-white">{project.techStack || "N/A"}</span>
            <span className="text-slate-500">Progress:</span>
            <span className="text-white">{project.progressPercent}%</span>
            <span className="text-slate-500">Guide status:</span>
            <span className="text-white">{project.guideStatus}</span>
            {project.studentId && (
              <>
                <span className="text-slate-500">Student:</span>
                <span className="text-white">{project.studentId.name}</span>
              </>
            )}
            {project.guideId && (
              <>
                <span className="text-slate-500">Guide:</span>
                <span className="text-white">{project.guideId.name}</span>
              </>
            )}
          </div>

          {/* Student: Tag guide */}
          {role === "student" &&
            project.guideStatus === "pending" &&
            project.guideId && (
              <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
                <p className="text-amber-400">
                  Waiting for guide approval from {project.guideId.name}.
                </p>
              </div>
            )}
          {role === "student" &&
            project.guideStatus !== "accepted" &&
            !project.guideId && (
              <div className="border border-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Tag a Guide</h3>
                <select
                  value={selectedGuide}
                  onChange={(e) => setSelectedGuide(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white mb-2"
                >
                  <option value="">Select guide</option>
                  {guides.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.department}) — {g.email}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleTagGuide}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm"
                >
                  Send Request
                </button>
              </div>
            )}

          {/* Guide: Accept / Reject */}
          {role === "guide" && project.guideStatus === "pending" && (
            <div className="border border-slate-700 rounded-lg p-4 flex gap-2">
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
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
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
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Reject
              </button>
            </div>
          )}

          {/* Progress update - Student */}
          {role === "student" && project.guideStatus === "accepted" && (
            <div className="border border-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Progress Update</h3>
              <textarea
                value={progressUpdate}
                onChange={(e) => setProgressUpdate(e.target.value)}
                placeholder="What did you do this week?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white mb-2"
              />
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(e.target.value)}
                  placeholder="Progress %"
                  className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
                />
                <button
                  onClick={handleProgressSubmit}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Project Timeline */}
          <div className="border border-slate-700 rounded-lg p-4">
            <ProjectTimelineChart project={project} height={350} />
          </div>

          {/* Milestones */}
          <div className="border border-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-white mb-3">Milestones</h3>
            <ul className="space-y-2">
              {(project.milestones || []).map((m) => (
                <li
                  key={m._id}
                  className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0"
                >
                  <div>
                    <span className="text-white">{m.name}</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs ${m.status === "approved" ? "bg-green-500/20 text-green-400" : m.status === "submitted" ? "bg-amber-500/20 text-amber-400" : "bg-slate-600 text-slate-400"}`}
                    >
                      {m.status}
                    </span>
                  </div>
                  {role === "student" && m.status === "pending" && (
                    <button
                      onClick={() => handleSubmitMilestone(m._id)}
                      className="px-3 py-1 rounded bg-primary-600 text-white text-sm"
                    >
                      Submit
                    </button>
                  )}
                  {role === "guide" && m.status === "submitted" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          handleGuideApproveMilestone(m._id, "approved")
                        }
                        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleGuideApproveMilestone(m._id, "corrections")
                        }
                        className="px-3 py-1 rounded bg-amber-600 text-white text-sm"
                      >
                        Corrections
                      </button>
                      <button
                        onClick={() =>
                          handleGuideApproveMilestone(m._id, "rejected")
                        }
                        className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Guide: Add review */}
          {role === "guide" && project.guideStatus === "accepted" && (
            <div className="border border-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">
                Add Review / Feedback
              </h3>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Comments"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white mb-2"
              />
              <select
                value={reviewMilestone}
                onChange={(e) => setReviewMilestone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white mb-2"
              >
                <option value="">General feedback</option>
                {(project.milestones || []).map((m) => (
                  <option key={m._id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white mb-2"
              >
                <option value="approved">Approved</option>
                <option value="corrections">Corrections needed</option>
                <option value="failed">Failed</option>
              </select>
              <button
                onClick={handleAddReview}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm"
              >
                Add Review
              </button>
            </div>
          )}

          {/* Guide: Complete Project */}
          {role === "guide" &&
            project.guideStatus === "accepted" &&
            project.finalReportPdf && (
              <div className="border border-green-600/50 bg-green-600/10 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">
                  Complete Project
                </h3>
                <p className="text-slate-300 text-sm mb-3">
                  {project.milestones.every((m) => m.status === "approved")
                    ? "All milestones are approved and final report is uploaded. You can mark this project as completed."
                    : `Complete project when all milestones are approved. Currently ${project.milestones.filter((m) => m.status === "approved").length}/${project.milestones.length} milestones approved.`}
                </p>
                <button
                  onClick={handleCompleteProject}
                  disabled={
                    !project.milestones.every((m) => m.status === "approved")
                  }
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                    project.milestones.every((m) => m.status === "approved")
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-slate-600 cursor-not-allowed"
                  }`}
                >
                  {project.milestones.every((m) => m.status === "approved")
                    ? "✓ Mark Project as Completed"
                    : "⏳ Pending Milestone Approvals"}
                </button>
              </div>
            )}

          {/* Project Completed Status */}
          {project.guideStatus === "completed" && (
            <div className="border border-green-600 bg-green-600/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-medium text-white">Project Completed</h3>
              </div>
              <p className="text-slate-300 text-sm">
                This project was successfully completed on{" "}
                {project.completedAt
                  ? new Date(project.completedAt).toLocaleDateString()
                  : "unknown date"}
                .
              </p>
            </div>
          )}

          {/* Review Score History Chart */}
          <div className="border border-slate-700 rounded-lg p-4">
            <ReviewScoreHistoryChart projectId={projectId} height={350} />
          </div>

          {/* Reviews list */}
          {reviews && reviews.length > 0 && (
            <div className="border border-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Guide Feedback</h3>
              <ul className="space-y-2">
                {reviews.map((r) => (
                  <li
                    key={r._id}
                    className="text-slate-300 text-sm border-l-2 border-slate-600 pl-3"
                  >
                    {r.comments} —{" "}
                    <span className="text-slate-500">
                      {r.milestoneName || "General"} • {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ML Delay Risk - Student */}
          {role === "student" && (
            <div className="border border-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Delay Risk (ML)</h3>
              {delayRisk === null ? (
                <button
                  onClick={fetchDelayRisk}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm"
                >
                  Check Delay Risk
                </button>
              ) : delayRisk.delayRisk === "error" ? (
                <p className="text-amber-400">
                  ML service unavailable. Ensure Python is installed and
                  ml-service dependencies are installed.
                </p>
              ) : (
                <p
                  className={`font-medium ${delayRisk.delayRisk === "high" ? "text-red-400" : delayRisk.delayRisk === "medium" ? "text-amber-400" : "text-green-400"}`}
                >
                  Risk: {delayRisk.delayRisk} —{" "}
                  {delayRisk.detail?.message || ""}
                </p>
              )}
              {mlReport && (
                <p className="text-slate-500 text-sm mt-1">
                  Stored: {mlReport.delayRisk}
                </p>
              )}
            </div>
          )}

          {/* PDFs */}
          <div className="flex gap-4">
            {proposalUrl && (
              <a
                href={proposalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline"
              >
                View Proposal PDF
              </a>
            )}
            {finalUrl && (
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline"
              >
                View Final Report PDF
              </a>
            )}
          </div>

          {/* Final report upload - Student */}
          {role === "student" && project.guideStatus === "accepted" && (
            <div className="border border-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">
                Upload Final Report PDF
              </h3>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFinalReportFile(e.target.files?.[0])}
                className="mb-2 text-slate-400 text-sm"
              />
              <button
                onClick={handleFinalReportUpload}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm"
              >
                Upload
              </button>
            </div>
          )}

          {/* Progress updates list */}
          {project.progressUpdates && project.progressUpdates.length > 0 && (
            <div className="border border-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Progress History</h3>
              <ul className="space-y-1 text-slate-400 text-sm">
                {project.progressUpdates.map((u, i) => (
                  <li key={i}>
                    {u.text} — {new Date(u.createdAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
