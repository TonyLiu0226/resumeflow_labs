"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ResumeTable from "./components/ResumeTable";
import KeywordAnalysis from "./components/KeywordAnalysis";
import crypto from "crypto";
interface ResumeSummary {
  id: string;
  name: string;
  dateCreated: string;
  dateModified: string;
}

type DashboardTab = "resumes" | "keywords" | "jobs" | "coverLetters";

const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "resumes", label: "My Resumes" },
  { id: "keywords", label: "Keywords" },
  { id: "jobs", label: "My Jobs" },
  { id: "coverLetters", label: "My Cover Letters" },
];

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumes");
  const [isLoading, setIsLoading] = useState(true);

  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newResumeName, setNewResumeName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/resume/list?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      setResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  useEffect(() => {
    if (showNewDialog) {
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [showNewDialog]);

  function handleDelete(id: string) {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  function openNewResumeDialog() {
    setNewResumeName("");
    setCreateError(null);
    setShowNewDialog(true);
  }

  function closeNewResumeDialog() {
    setShowNewDialog(false);
    setNewResumeName("");
    setCreateError(null);
  }

  async function handleCreateResume(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = newResumeName.trim();
    if (!trimmedName) {
      setCreateError("Please enter a resume name.");
      return;
    }

    const userId = session?.user?.id;
    if (!userId) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          resumeId: crypto.randomBytes(16).toString("hex"),
          name: trimmedName,
          contact: { email: "", phone: "", github: "", linkedin: "" },
          education: [],
          experience: [],
          projects: [],
          skillCategories: [],
        }),
      });

      if (!res.ok) throw new Error("Failed to create resume");

      const { id } = await res.json();
      closeNewResumeDialog();
      router.push(`/resume/${id}`);
    } catch (error) {
      console.error("Create error:", error);
      setCreateError("Failed to create resume. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-zinc-200 shrink-0">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">ResumeFlow Labs</h1>
            <p className="text-xs text-zinc-400">Dashboard</p>
          </div>
          {session?.user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">{session.user.email}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Tab navigation ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-zinc-200">
        <nav className="max-w-6xl mx-auto px-6 flex gap-1" aria-label="Dashboard sections">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────────── */}
      <main className={`flex-1 w-full mx-auto px-6 py-8 ${activeTab === "keywords" ? "max-w-[1600px]" : "max-w-6xl"}`}>
        {/* ── My Resumes ─────────────────────────────────────────────────────── */}
        {activeTab === "resumes" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">My Resumes</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Manage and edit your resumes
                </p>
              </div>
              <button
                type="button"
                onClick={openNewResumeDialog}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Resume
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <svg className="animate-spin h-6 w-6 text-zinc-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              <ResumeTable resumes={resumes} onDelete={handleDelete} />
            )}
          </section>
        )}

        {/* ── Keywords ─────────────────────────────────────────────────────── */}
        {activeTab === "keywords" && (
          <KeywordAnalysis resumes={resumes} />
        )}

        {/* ── My Jobs ────────────────────────────────────────────────────────── */}
        {activeTab === "jobs" && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">My Jobs</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Track your job applications
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Coming soon</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Job tracking features are under development. You&apos;ll be able to manage
                your job applications and match them with your resumes.
              </p>
            </div>
          </section>
        )}

        {/* ── My Cover Letters ───────────────────────────────────────────────── */}
        {activeTab === "coverLetters" && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">My Cover Letters</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Create and manage cover letters
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Coming soon</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Cover letter features are under development. You&apos;ll be able to create
                tailored cover letters for each job application.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* ── New Resume Dialog ──────────────────────────────────────────────────── */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeNewResumeDialog}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              Create New Resume
            </h3>
            <p className="text-sm text-zinc-500 mb-5">
              Give your resume a name to get started.
            </p>

            <form onSubmit={handleCreateResume}>
              <label htmlFor="resume-name" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Resume Name
              </label>
              <input
                ref={nameInputRef}
                id="resume-name"
                type="text"
                value={newResumeName}
                onChange={(e) => setNewResumeName(e.target.value)}
                placeholder='e.g. "Software Engineer - Google"'
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {createError && (
                <p className="mt-2 text-sm text-red-600">{createError}</p>
              )}

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeNewResumeDialog}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 disabled:opacity-60 transition-colors"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating…
                    </>
                  ) : (
                    "Create Resume"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
