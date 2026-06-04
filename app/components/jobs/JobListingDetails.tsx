"use client";

import { useState, useTransition } from "react";
import { JobListing } from "../../types/job";
import { tailorResumeAction } from "../../server/tailorAction";
import ResumeEditor from "../ResumeEditor";

interface ResumeSummary {
  id: string;
  name: string;
}

interface JobListingDetailsProps {
  listing: JobListing;
  resumes: ResumeSummary[];
  onClose: () => void;
  onApply: (listing: JobListing, resumeId: string, resumeName: string) => Promise<void>;
  onNavigateToKeywords: (resumeId: string, jobDescription: string) => void;
}

export default function JobListingDetails({
  listing,
  resumes,
  onClose,
  onApply,
  onNavigateToKeywords,
}: JobListingDetailsProps) {
  const defaultResumeId = resumes.length > 0 ? resumes[0].id : "";
  const [selectedResumeId, setSelectedResumeId] = useState(defaultResumeId);
  const [isApplying, setIsApplying] = useState(false);
  const [isTailoring, startTailoring] = useTransition();
  const [tailorResult, setTailorResult] = useState<{ newResumeId: string | null; message: string } | null>(null);
  const [tailorError, setTailorError] = useState(false);

  async function handleApply() {
    setIsApplying(true);
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    try {
      await onApply(
        listing,
        selectedResumeId,
        selectedResume?.name || ""
      );
      window.open(listing.applyUrl, "_blank", "noopener,noreferrer");
      onClose();
    } catch (error) {
      console.error("Error applying to job:", error);
    } finally {
      setIsApplying(false);
    }
  }

  function handleAnalyzeKeywords() {
    if (!selectedResumeId || resumes.length === 0) return;
    onNavigateToKeywords(selectedResumeId, listing.description);
    onClose();
  }

  function handleAutoTailor() {
    if (!selectedResumeId || resumes.length === 0) return;
    setTailorResult(null);
    setTailorError(false);
    startTailoring(async () => {
      try {
        const result = await tailorResumeAction(listing, selectedResumeId);
        setTailorResult(result);
      } catch (error) {
        console.error("Error tailoring resume:", error);
        setTailorError(true);
        setTailorResult({ newResumeId: null, message: "Error occurred while tailoring the resume." });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-zinc-100">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-zinc-900 truncate">
              {listing.jobTitle}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">{listing.company}</p>
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
          {tailorResult?.newResumeId ? (
            <div className="h-full min-h-[500px]">
              <ResumeEditor resumeId={tailorResult.newResumeId} keywords={[]} />
            </div>
          ) : (
            <>
              {/* Location + Date */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {listing.location}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="text-sm text-zinc-500">
                  Posted{" "}
                  {new Date(listing.postedDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Job Description */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                  Job Description
                </h4>
                <div className="text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 rounded-lg p-4 border border-zinc-100 max-h-72 overflow-y-auto">
                  {listing.description}
                </div>
              </div>

              {/* Resume selector */}
              <div>
                <label
                  htmlFor="listing-resume"
                  className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5"
                >
                  Resume to Use
                </label>
                {resumes.length > 0 ? (
                  <select
                    id="listing-resume"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-zinc-400 italic">
                    No resumes available. Create one first.
                  </p>
                )}
              </div>

              {/* Tailor Result */}
              {tailorResult && (
                <div className={`p-4 ${
                  tailorError 
                    ? "bg-red-50 text-red-900 border-red-200"
                    : "bg-green-50 text-green-900 border-green-200"
                } rounded-lg text-sm whitespace-pre-wrap border `}>
                  <h4 className="font-semibold mb-2">Tailoring Result:</h4>
                  {tailorResult.message || tailorResult}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Close
          </button>
          
          {!tailorResult?.newResumeId && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAutoTailor}
                disabled={isTailoring || resumes.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-60 transition-colors"
              >
                {isTailoring ? "Tailoring..." : "Auto Tailor"}
              </button>
              <button
                type="button"
                onClick={handleAnalyzeKeywords}
                disabled={resumes.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-60 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Analyze Keywords
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying || resumes.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isApplying ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Applying...
                  </>
                ) : (
                  "Apply Now"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
