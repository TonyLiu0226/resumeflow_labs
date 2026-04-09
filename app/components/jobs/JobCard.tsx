"use client";

import { Job, STATUS_CONFIG } from "../../types/job";

interface JobCardProps {
  job: Job;
  onClickCard: (job: Job) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
}

export default function JobCard({ job, onClickCard, onDelete, onDragStart }: JobCardProps) {
  const config = STATUS_CONFIG[job.status];

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(job.id);
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, job.id)}
      onClick={() => onClickCard(job)}
      className="group bg-white rounded-lg border border-zinc-200 p-3 cursor-grab active:cursor-grabbing
                 hover:shadow-md hover:border-zinc-300 transition-all duration-150 select-none"
    >
      {/* Header: company + delete */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-semibold text-zinc-900 leading-tight truncate">
          {job.company}
        </h4>
        <button
          type="button"
          onClick={handleDeleteClick}
          title="Delete job"
          className="shrink-0 p-1 rounded-md text-zinc-300 opacity-0 group-hover:opacity-100
                     hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Job title */}
      <p className="text-xs text-zinc-600 mb-2 truncate">{job.jobTitle}</p>

      {/* Footer: date + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-400">
          {new Date(job.dateApplied).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.color} ${config.bgColor}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
