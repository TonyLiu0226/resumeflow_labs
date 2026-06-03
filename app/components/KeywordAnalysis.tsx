"use client";

import { useState } from "react";
import ResumeEditor, { type KeywordResult } from "./ResumeEditor";
import { analyzeKeywords } from "../server/keywordsAction";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ResumeSummary {
  id: string;
  name: string;
  dateCreated: string;
  dateModified: string;
}

interface ExtractedKeyword {
  keyword: string;
  importance_level: "High" | "Medium" | "Low";
}

interface AnalysisResult {
  jobTitle: string;
  keywords: KeywordResult[];
  matchCount: number;
  totalCount: number;
  percentage: number;
  grade: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function computeGrade(pct: number): string {
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "text-green-600";
    case "B":
      return "text-blue-600";
    case "C":
      return "text-yellow-600";
    case "D":
      return "text-orange-600";
    default:
      return "text-red-600";
  }
}

function gradeBg(grade: string): string {
  switch (grade) {
    case "A":
      return "bg-green-50 border-green-200";
    case "B":
      return "bg-blue-50 border-blue-200";
    case "C":
      return "bg-yellow-50 border-yellow-200";
    case "D":
      return "bg-orange-50 border-orange-200";
    default:
      return "bg-red-50 border-red-200";
  }
}

/**
 * Build a single lowercase string from every meaningful field in the resume,
 * so keyword look-ups are a simple `includes` check.
 */
function normalizeText(text: string): string {
  // Lowercase and remove punctuation except . # & % +
  // Keep letters, numbers, spaces, and the allowed punctuation.
  // Remove hyphens, underscores, and other punctuation marks.
  return text
    .toLowerCase()
    .replace(/[!"'$(),\-/:;<=>?@\[\]\\^_`{|}~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildResumeText(resume: Record<string, unknown>): string {
  const parts: string[] = [];

  // Contact
  const contact = resume.contact as Record<string, string> | null;
  if (contact) {
    parts.push(contact.name ?? "", contact.email ?? "");
  }

  // Education
  const education = resume.education as Array<Record<string, unknown>> | undefined;
  if (education) {
    for (const edu of education) {
      parts.push(
        (edu.school as string) ?? "",
        (edu.degree as string) ?? "",
        (edu.location as string) ?? ""
      );
      const courses = edu.courses as Array<Record<string, string>> | undefined;
      if (courses) {
        for (const c of courses) {
          parts.push(c.name ?? "");
        }
      }
    }
  }

  // Experience
  const experience = resume.experience as Array<Record<string, unknown>> | undefined;
  if (experience) {
    for (const exp of experience) {
      parts.push(
        (exp.jobTitle as string) ?? "",
        (exp.companyName as string) ?? "",
        (exp.location as string) ?? ""
      );
      const bullets = exp.bullets as Array<Record<string, string>> | undefined;
      if (bullets) {
        for (const b of bullets) {
          parts.push(b.content ?? "");
        }
      }
    }
  }

  // Projects
  const projects = resume.projects as Array<Record<string, unknown>> | undefined;
  if (projects) {
    for (const proj of projects) {
      parts.push(
        (proj.projectTitle as string) ?? "",
        (proj.github as string) ?? ""
      );
      const bullets = proj.bullets as Array<Record<string, string>> | undefined;
      if (bullets) {
        for (const b of bullets) {
          parts.push(b.content ?? "");
        }
      }
    }
  }

  // Skills
  const skills = resume.skills as Record<string, unknown> | null;
  if (skills) {
    const categories = skills.categories as Array<Record<string, unknown>> | undefined;
    if (categories) {
      for (const cat of categories) {
        parts.push((cat.name as string) ?? "");
        const items = cat.items as Array<Record<string, string>> | undefined;
        if (items) {
          for (const item of items) {
            parts.push(item.name ?? "");
          }
        }
      }
    }
  }

  return normalizeText(parts.join(" "));
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface KeywordAnalysisProps {
  resumes: ResumeSummary[];
  initialResumeId?: string;
  initialJobDescription?: string;
}

export default function KeywordAnalysis({ 
  resumes,
  initialResumeId = "",
  initialJobDescription = ""
}: KeywordAnalysisProps) {
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleAnalyze() {
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // 1. Extract keywords from job description
      let raw: string;
      try {
        raw = await analyzeKeywords(jobDescription);
      } catch (err: any) {
        throw new Error(err.message || "Failed to extract keywords");
      }

      // Parse the LLM JSON response (may be wrapped in markdown fences)
      raw = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
      let parsed: {
        job_title?: string;
        keywords?: { technical_skills?: ExtractedKeyword[] };
        top_priority_keywords?: string[];
      };
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.log(raw);
        throw new Error("The AI returned an invalid response. Please try again.");
      }

      const extractedKeywords: ExtractedKeyword[] =
        parsed.keywords?.technical_skills ?? [];

      if (extractedKeywords.length === 0) {
        throw new Error("No keywords were extracted from the job description.");
      }

      // 2. Load the selected resume
      const resumeRes = await fetch(`/api/resume/load?id=${selectedResumeId}`);
      if (!resumeRes.ok) throw new Error("Failed to load resume data");
      const resumeData = await resumeRes.json();

      // 3. Compare keywords against resume text
      const resumeText = buildResumeText(resumeData);
      const keywordResults: KeywordResult[] = extractedKeywords.map((kw) => ({
        keyword: kw.keyword,
        importance: kw.importance_level,
        found: resumeText.includes(normalizeText(kw.keyword)),
      }));

      const matchCount = keywordResults.filter((k) => k.found).length;
      const totalCount = keywordResults.length;
      const percentage = Math.round((matchCount / totalCount) * 100);

      setResult({
        jobTitle: parsed.job_title ?? "Unknown Position",
        keywords: keywordResults,
        matchCount,
        totalCount,
        percentage,
        grade: computeGrade(percentage),
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Sort: missing keywords first, then by importance (High > Medium > Low)
  const sortedKeywords = result
    ? [...result.keywords].sort((a, b) => {
        if (a.found !== b.found) return a.found ? 1 : -1;
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.importance] - order[b.importance];
      })
    : [];

  return (
    <section className="flex gap-6 items-start">
      {/* ── Left: analysis panel ──────────────────────────────────────────────── */}
      <div className="w-[420px] shrink-0 space-y-5 sticky top-4 max-h-[calc(100vh-7rem)] overflow-y-auto pb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Resume Keyword Analysis
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Compare your resume against a job description to find missing keywords
          </p>
        </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-5">
        {/* Resume selector */}
        <div>
          <label
            htmlFor="resume-select"
            className="block text-sm font-medium text-zinc-700 mb-1.5"
          >
            Select Resume
          </label>
          <select
            id="resume-select"
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">— Choose a resume —</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Job description */}
        <div>
          <label
            htmlFor="job-desc"
            className="block text-sm font-medium text-zinc-700 mb-1.5"
          >
            Job Description
          </label>
          <textarea
            id="job-desc"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here…"
            rows={8}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          />
        </div>

        {/* Analyze button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing…
            </>
          ) : (
            "Analyze Keywords"
          )}
        </button>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
      </div>

      {/* ── Results ───────────────────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-4">
          {/* Grade card */}
          <div
            className={`rounded-xl border p-5 flex items-center gap-5 ${gradeBg(result.grade)}`}
          >
            <div
              className={`text-5xl font-extrabold leading-none ${gradeColor(result.grade)}`}
            >
              {result.grade}
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900">
                {result.percentage}% keyword match
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                {result.matchCount} of {result.totalCount} found for{" "}
                <span className="font-medium">{result.jobTitle}</span>
              </p>
            </div>
          </div>

          {/* Keyword list */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Keyword Breakdown
              </h3>
            </div>
            <ul className="divide-y divide-zinc-100">
              {sortedKeywords.map((kw, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {kw.found ? (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold shrink-0">
                        ✓
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold shrink-0">
                        ✗
                      </span>
                    )}
                    <span
                      className={`text-sm truncate ${kw.found ? "text-zinc-600" : "text-zinc-900 font-medium"}`}
                    >
                      {kw.keyword}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      kw.importance === "High"
                        ? "bg-red-50 text-red-700"
                        : kw.importance === "Medium"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {kw.importance}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      </div>{/* end left panel */}

      {/* ── Right: resume editor ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 sticky top-4 max-h-[calc(100vh-7rem)] overflow-y-auto pb-4">
        <ResumeEditor
          resumeId={selectedResumeId || null}
          keywords={result?.keywords ?? []}
        />
      </div>
    </section>
  );
}
