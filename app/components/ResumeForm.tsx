"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import type {
  ContactInfo,
  Education,
  Experience,
  Project,
  ResumeFormData,
  SkillCategory,
} from "../types/resume";
import ContactSection from "./sections/ContactSection";
import EducationSection from "./sections/EducationSection";
import ExperienceSection from "./sections/ExperienceSection";
import ProjectsSection from "./sections/ProjectsSection";
import SkillsSection from "./sections/SkillsSection";
import PdfPreview from "./PdfPreview";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = "contact" | "education" | "experience" | "projects" | "skills";

const TABS: { id: Tab; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const DEFAULT_CONTACT: ContactInfo = {
  github: "",
  phone: "",
  email: "",
  linkedin: "",
};

const makeEducation = (): Education => ({
  id: generateId(),
  schoolName: "",
  location: "",
  degree: "",
  dateAchieved: "",
  courses: [],
});

const makeExperience = (): Experience => ({
  id: generateId(),
  jobTitle: "",
  startDate: "",
  endDate: "",
  companyName: "",
  location: "",
  bulletPoints: [],
});

const makeProject = (): Project => ({
  id: generateId(),
  title: "",
  startDate: "",
  endDate: "",
  githubLink: "",
  bulletPoints: [],
});

const makeSkillCategory = (): SkillCategory => ({
  id: generateId(),
  name: "",
  skills: new Set<string>(),
});

/** Convert form data to a JSON-safe payload (Set → array). */
function toPayload(data: ResumeFormData) {
  return {
    ...data,
    skillCategories: data.skillCategories.map((cat) => ({
      ...cat,
      skills: [...cat.skills],
    })),
  };
}

// ─── LocalStorage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = "resumeflow_form_data";

/** Save form data to localStorage (converts Sets to arrays). */
function saveToLocalStorage(data: ResumeFormData): void {
  try {
    const payload = toPayload(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

/** Stored skill category type (with skills as array instead of Set). */
interface StoredSkillCategory {
  id: string;
  name: string;
  skills: string[];
}

/** Load form data from localStorage (converts arrays back to Sets). */
function loadFromLocalStorage(): ResumeFormData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    // Convert skill arrays back to Sets
    if (parsed.skillCategories) {
      parsed.skillCategories = parsed.skillCategories.map((cat: StoredSkillCategory) => ({
        ...cat,
        skills: new Set(cat.skills || []),
      }));
    }
    return parsed;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
}

// ─── ResumeForm ────────────────────────────────────────────────────────────────

export default function ResumeForm() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("contact");
  const [data, setData] = useState<ResumeFormData>(() => {
    if (typeof window !== "undefined") {
      const saved = loadFromLocalStorage();
      if (saved) return saved;
    }
    return {
      contact: DEFAULT_CONTACT,
      education: [],
      experience: [],
      projects: [],
      skillCategories: [],
    };
  });

  // Preview state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // ── Auto-save to localStorage whenever data changes ──────────────────────────
  useEffect(() => {
    saveToLocalStorage(data);
  }, [data]);

  // ── Contact ──────────────────────────────────────────────────────────────────
  const updateContact = (contact: ContactInfo) =>
    setData((prev) => ({ ...prev, contact }));

  // ── Education ────────────────────────────────────────────────────────────────
  const addEducation = () => {
    if (data.education.length >= 5) return;
    setData((prev) => ({
      ...prev,
      education: [...prev.education, makeEducation()],
    }));
  };

  const updateEducation = (id: string, updates: Partial<Education>) =>
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));

  const removeEducation = (id: string) =>
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));

  // ── Experience ───────────────────────────────────────────────────────────────
  const addExperience = () => {
    if (data.experience.length >= 15) return;
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, makeExperience()],
    }));
  };

  const updateExperience = (id: string, updates: Partial<Experience>) =>
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));

  const removeExperience = (id: string) =>
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));

  // ── Projects ─────────────────────────────────────────────────────────────────
  const addProject = () => {
    if (data.projects.length >= 30) return;
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, makeProject()],
    }));
  };

  const updateProject = (id: string, updates: Partial<Project>) =>
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));

  const removeProject = (id: string) =>
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));

  // ── Skill Categories ─────────────────────────────────────────────────────────
  const addSkillCategory = () => {
    if (data.skillCategories.length >= 10) return;
    setData((prev) => ({
      ...prev,
      skillCategories: [...prev.skillCategories, makeSkillCategory()],
    }));
  };

  const updateSkillCategory = (id: string, updates: Partial<SkillCategory>) => {
    setData((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  };

  const removeSkillCategory = (id: string) =>
    setData((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.filter((c) => c.id !== id),
    }));

  // ── Completion indicators ─────────────────────────────────────────────────
  const sectionCounts: Record<Tab, number> = {
    contact: [data.contact.email, data.contact.phone, data.contact.linkedin, data.contact.github].filter(Boolean).length,
    education: data.education.length,
    experience: data.experience.length,
    projects: data.projects.length,
    skills: data.skillCategories.reduce((sum, c) => sum + c.skills.size, 0),
  };

  // ── Preview handler (write → render → display) ───────────────────────────
  const handlePreview = useCallback(async () => {
    setIsBuilding(true);
    setPreviewError(null);

    try {
      // Step 1: Write LaTeX
      const writeRes = await fetch("/api/resume/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(data)),
      });
      if (!writeRes.ok) {
        const err = await writeRes.json().catch(() => null);
        throw new Error(err?.error ?? "Failed to generate LaTeX");
      }
      const { id } = await writeRes.json();

      // Step 2: Render PDF
      const renderRes = await fetch("/api/resume/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!renderRes.ok) {
        const err = await renderRes.json().catch(() => null);
        throw new Error(err?.error ?? "Failed to render PDF");
      }

      const blob = await renderRes.blob();

      // Revoke previous blob URL to free memory
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);

      setPdfUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Preview error:", error);
      setPreviewError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsBuilding(false);
    }
  }, [data, pdfUrl]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-zinc-200 shrink-0 z-20">
        <div className="px-6 flex items-center justify-between py-3">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">ResumeFlow Labs</h1>
            <p className="text-xs text-zinc-400">Resume Builder</p>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600">
                  {session.user.name}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
            <button
              type="button"
              disabled={isBuilding}
              onClick={handlePreview}
              className="cursor-pointer flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              {isBuilding ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Building…
                </>
              ) : (
                "Preview Resume →"
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Two-column body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left: Form ─────────────────────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col min-h-0 border-r border-zinc-200">
          {/* Tab bar */}
          <nav
            className="flex shrink-0 overflow-x-auto bg-white border-b border-zinc-200 px-4"
            aria-label="Form sections"
          >
            {TABS.map((tab) => {
              const count = sectionCounts[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <span>{tab.label}</span>
                    <span
                      className={`cursor-pointer inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {count}
                    </span>
                </button>
              );
            })}
          </nav>

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "contact" && (
              <ContactSection contact={data.contact} onChange={updateContact} />
            )}
            {activeTab === "education" && (
              <EducationSection
                education={data.education}
                onAdd={addEducation}
                onUpdate={updateEducation}
                onRemove={removeEducation}
              />
            )}
            {activeTab === "experience" && (
              <ExperienceSection
                experience={data.experience}
                onAdd={addExperience}
                onUpdate={updateExperience}
                onRemove={removeExperience}
              />
            )}
            {activeTab === "projects" && (
              <ProjectsSection
                projects={data.projects}
                onAdd={addProject}
                onUpdate={updateProject}
                onRemove={removeProject}
              />
            )}
            {activeTab === "skills" && (
              <SkillsSection
                skillCategories={data.skillCategories}
                onAddCategory={addSkillCategory}
                onUpdateCategory={updateSkillCategory}
                onRemoveCategory={removeSkillCategory}
              />
            )}
          </div>
        </div>

        {/* ── Right: PDF Preview ─────────────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col min-h-0 bg-zinc-100">
          {pdfUrl ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                <div className="w-full max-w-3xl mx-auto">
                  <PdfPreview url={pdfUrl} />
                </div>
              </div>

              <div className="shrink-0 p-6 pt-0">
                <a
                  href={pdfUrl}
                  download="resume.pdf"
                  className="w-full flex items-center justify-center px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              {previewError ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 mb-1">Preview failed</p>
                  <p className="text-xs text-red-500 max-w-xs">{previewError}</p>
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="cursor-pointer mt-4 text-sm text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-zinc-200 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-zinc-500 mb-1">No preview yet</p>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Fill in your details on the left, then click 
                    the button below to compile your PDF.
                  </p>
                  <button
                        type="button"
                        disabled={isBuilding}
                        onClick={handlePreview}
                        className="cursor-pointer mt-10 flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
                    >Preview Resume</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
