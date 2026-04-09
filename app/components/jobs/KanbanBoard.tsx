"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Job, JobListing, JobStatus, JOB_STATUSES, STATUS_CONFIG } from "../../types/job";
import JobCard from "./JobCard";
import JobDetails from "./JobDetails";
import JobListingSidebar from "./JobListingSidebar";

interface ResumeSummary {
  id: string;
  name: string;
}

interface KanbanBoardProps {
  resumes: ResumeSummary[];
}

export default function KanbanBoard({ resumes }: KanbanBoardProps) {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);
  const draggedJobId = useRef<string | null>(null);

  // ── Fetch jobs ──────────────────────────────────────────────────────────────

  const fetchJobs = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/jobs?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Group jobs by status ────────────────────────────────────────────────────

  function getJobsByStatus(status: JobStatus): Job[] {
    return jobs.filter((j) => j.status === status);
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, jobId: string) {
    draggedJobId.current = jobId;
    e.dataTransfer.effectAllowed = "move";
    const target = e.currentTarget;
    requestAnimationFrame(() => {
      target.style.opacity = "0.5";
    });
  }

  function handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
    e.currentTarget.style.opacity = "1";
    setDragOverColumn(null);
    draggedJobId.current = null;
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, status: JobStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>, newStatus: JobStatus) {
    e.preventDefault();
    setDragOverColumn(null);

    const jobId = draggedJobId.current;
    if (!jobId) return;

    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    // Optimistic update
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    try {
        console.log("Updating job status to:", newStatus);
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (error) {
      console.error("Error updating job status:", error);
      // Revert on failure
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: job.status } : j))
      );
    }
  }

  // ── Delete single job ───────────────────────────────────────────────────────

  async function handleDeleteJob(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id));

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
    } catch (error) {
      console.error("Error deleting job:", error);
      fetchJobs(); // Refetch on failure
    }
  }

  // ── Delete all rejected ────────────────────────────────────────────────────

  async function handleDeleteRejected() {
    const rejectedCount = jobs.filter((j) => j.status === "Rejected").length;
    if (rejectedCount === 0) return;

    if (!confirm(`Delete all ${rejectedCount} rejected job(s)?`)) return;

    const userId = session?.user?.id;
    if (!userId) return;

    setJobs((prev) => prev.filter((j) => j.status !== "Rejected"));

    try {
      const res = await fetch(`/api/jobs/rejected?userId=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete rejected jobs");
    } catch (error) {
      console.error("Error deleting rejected jobs:", error);
      fetchJobs();
    }
  }

  // ── Add job handler ─────────────────────────────────────────────────────────

  async function handleAddJob(jobData: {
    company: string;
    jobTitle: string;
    description: string;
    resumeId: string;
    resumeName: string;
    dateApplied: string;
  }) {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...jobData }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      const newJob = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  }

  // ── Apply from listing ─────────────────────────────────────────────────────

  async function handleApplyFromListing(
    listing: JobListing,
    resumeId: string,
    resumeName: string
  ) {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          company: listing.company,
          jobTitle: listing.jobTitle,
          description: listing.description,
          resumeId,
          resumeName,
          dateApplied: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      const newJob = await res.json();
      setJobs((prev) => [newJob, ...prev]);
    } catch (error) {
      console.error("Error applying from listing:", error);
      throw error;
    }
  }

  // ── Loading state ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="animate-spin h-6 w-6 text-zinc-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const rejectedCount = jobs.filter((j) => j.status === "Rejected").length;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">My Jobs</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Track your job applications &middot; {jobs.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {rejectedCount > 0 && (
            <button
              type="button"
              onClick={handleDeleteRejected}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              Delete Rejected ({rejectedCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Job
          </button>
        </div>
      </div>

      {/* Sidebar + Kanban columns */}
      <div className="flex gap-4">
        {/* Job listings sidebar */}
        <JobListingSidebar resumes={resumes} onApply={handleApplyFromListing} />

        {/* Kanban columns */}
        <div className="flex-1 grid grid-cols-5 gap-4 min-w-0">
          {JOB_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const columnJobs = getJobsByStatus(status);
            const isDragOver = dragOverColumn === status;

            return (
              <div
                key={status}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={`flex flex-col rounded-xl border-2 transition-colors min-h-[400px] ${
                  isDragOver
                    ? `${config.borderColor} ${config.bgColor}`
                    : "border-zinc-200 bg-zinc-50/50"
                }`}
              >
                {/* Column header */}
                <div className={`px-3 py-2.5 rounded-t-[10px] ${config.headerBg}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </h3>
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${config.color} ${config.bgColor}`}
                    >
                      {columnJobs.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {columnJobs.map((job) => (
                    <div key={job.id} onDragEnd={handleDragEnd}>
                      <JobCard
                        job={job}
                        onClickCard={setSelectedJob}
                        onDelete={handleDeleteJob}
                        onDragStart={handleDragStart}
                      />
                    </div>
                  ))}

                  {columnJobs.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-zinc-400">
                      Drop jobs here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job details modal */}
      {selectedJob && (
        <JobDetails
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDelete={handleDeleteJob}
        />
      )}

      {/* Add job dialog */}
      {showAddDialog && (
        <AddJobDialog
          resumes={resumes}
          onSubmit={handleAddJob}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}

// ─── Add Job Dialog ─────────────────────────────────────────────────────────────

interface AddJobDialogProps {
  resumes: ResumeSummary[];
  onSubmit: (data: {
    company: string;
    jobTitle: string;
    description: string;
    resumeId: string;
    resumeName: string;
    dateApplied: string;
  }) => Promise<void>;
  onClose: () => void;
}

interface ResumeSummary {
  id: string;
  name: string;
}

function AddJobDialog({ resumes, onSubmit, onClose }: AddJobDialogProps) {
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [dateApplied, setDateApplied] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => companyRef.current?.focus(), 0);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCompany = company.trim();
    const trimmedTitle = jobTitle.trim();

    if (!trimmedCompany || !trimmedTitle) {
      setError("Company and job title are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const selectedResume = resumes.find((r) => r.id === resumeId);

    try {
      await onSubmit({
        company: trimmedCompany,
        jobTitle: trimmedTitle,
        description: description.trim(),
        resumeId,
        resumeName: selectedResume?.name || "",
        dateApplied,
      });
    } catch {
      setError("Failed to add job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-1">Add Job</h3>
        <p className="text-sm text-zinc-500 mb-5">
          Track a new job application.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company */}
          <div>
            <label htmlFor="job-company" className="block text-sm font-medium text-zinc-700 mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              ref={companyRef}
              id="job-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-zinc-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date Applied */}
          <div>
            <label htmlFor="job-date" className="block text-sm font-medium text-zinc-700 mb-1">
              Date Applied
            </label>
            <input
              id="job-date"
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Resume Used */}
          <div>
            <label htmlFor="job-resume" className="block text-sm font-medium text-zinc-700 mb-1">
              Resume Used
            </label>
            <select
              id="job-resume"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-zinc-700 mb-1">
              Job Description
            </label>
            <textarea
              id="job-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Paste the job description here…"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding…
                </>
              ) : (
                "Add Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
