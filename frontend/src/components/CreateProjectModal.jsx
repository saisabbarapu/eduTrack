import React, { useEffect, useState } from 'react';
import DuplicateTopicDetectionChart from './DuplicateTopicDetectionChart.jsx';

export default function CreateProjectModal({ onClose, onSubmit, onCheckDuplicate, duplicateMessage, defaultMilestones, guides, rollNumber }) {
  const [form, setForm] = useState({
    title: '',
    abstract: '',
    domain: 'Web',
    techStack: '',
    startDate: new Date().toISOString().slice(0, 10),
    expectedEndDate: '',
    studentRollNumber: '',
    guideId: '',
    department: '',
    batchYear: '',
    teamMembers: '',
    milestones: defaultMilestones || []
  });
  const [proposalFile, setProposalFile] = useState(null);
  const [duplicateData, setDuplicateData] = useState(null);
  const [showDuplicateChart, setShowDuplicateChart] = useState(false);

  // Prefill if available, but student must confirm/edit manually
  useEffect(() => {
    if (!rollNumber) return;
    setForm((f) => ({ ...f, studentRollNumber: f.studentRollNumber || rollNumber }));
  }, [rollNumber]);

  // If guides load after modal opens, optionally auto-select first guide
  useEffect(() => {
    if (form.guideId) return;
    if (Array.isArray(guides) && guides.length > 0) {
      setForm((f) => ({ ...f, guideId: f.guideId || guides[0]._id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guides]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'title' && value.length > 5) {
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
    if (!form.studentRollNumber || !form.studentRollNumber.trim()) return alert('Please enter your roll number');
    if (!form.guideId) return alert('Please select a guide to tag');
    onSubmit(form, proposalFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="font-display text-xl font-semibold text-white">Create Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Duplicate Detection Chart */}
          {showDuplicateChart && duplicateData && (
            <div className="border border-slate-700 rounded-lg p-4">
              <DuplicateTopicDetectionChart duplicateData={duplicateData} height={300} />
            </div>
          )}
          
          {/* Legacy Duplicate Message */}
          {duplicateMessage && !showDuplicateChart && (
            <div className={`p-3 rounded-lg text-sm ${duplicateMessage.includes('similar') ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
              {duplicateMessage}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Abstract / Description *</label>
            <textarea name="abstract" value={form.abstract} onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))} rows={3} required className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Domain</label>
              <select name="domain" value={form.domain} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white">
                <option>Web</option>
                <option>AI/ML</option>
                <option>IoT</option>
                <option>Mobile</option>
                <option>Cloud</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tech Stack</label>
              <input name="techStack" value={form.techStack} onChange={handleChange} placeholder="React, Node, MongoDB" className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Roll Number</label>
              <input
                name="studentRollNumber"
                value={form.studentRollNumber}
                onChange={handleChange}
                placeholder="e.g. CSE23MCA001"
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">Enter your college roll number for verification.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tag Guide *</label>
              <select
                name="guideId"
                value={form.guideId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              >
                <option value="">Select guide</option>
                {(guides || []).map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} ({g.department}) — {g.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Expected End Date</label>
              <input name="expectedEndDate" type="date" value={form.expectedEndDate} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Batch Year</label>
              <input name="batchYear" value={form.batchYear} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Team Members (comma separated)</label>
            <input name="teamMembers" value={form.teamMembers} onChange={handleChange} placeholder="Name1, Name2" className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Proposal PDF</label>
            <input type="file" accept=".pdf" onChange={(e) => setProposalFile(e.target.files?.[0])} className="w-full text-slate-400 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
