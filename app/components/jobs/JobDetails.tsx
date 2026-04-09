"use client";

import { Job, STATUS_CONFIG } from "../../types/job";

interface JobDetailsProps {
  job: Job;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function JobDetails({ job, onClose, onDelete }: JobDetailsProps) {
  const config = STATUS_CONFIG[job.status];

  function handleDelete() {
    onDelete(job.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-zinc-100">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-zinc-900 truncate">
              {job.company}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5 truncate">{job.jobTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status + Date row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${config.color} ${config.bgColor}`}
            >
              {config.label}
            </span>
            <span className="text-sm text-zinc-500">
              Applied{" "}
              {new Date(job.dateApplied).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Resume used */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Resume Used
            </h4>
            {job.resumeName ? (
              <p className="text-sm text-zinc-700">{job.resumeName}</p>
            ) : (
              <p className="text-sm text-zinc-400 italic">No resume linked</p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Job Description
            </h4>
            {job.description ? (
              <div className="text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 rounded-lg p-4 border border-zinc-100 max-h-64 overflow-y-auto">
                {job.description}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 italic">No description provided</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Delete Job
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
