"use client";

import { useState } from "react";
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

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = "contact" | "education" | "experience" | "projects" | "skills";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "contact", label: "Contact", emoji: "📋" },
  { id: "education", label: "Education", emoji: "🎓" },
  { id: "experience", label: "Experience", emoji: "💼" },
  { id: "projects", label: "Projects", emoji: "🚀" },
  { id: "skills", label: "Skills", emoji: "⚡" },
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

// ─── ResumeForm ────────────────────────────────────────────────────────────────

export default function ResumeForm() {
  const [activeTab, setActiveTab] = useState<Tab>("contact");
  const [data, setData] = useState<ResumeFormData>({
    contact: DEFAULT_CONTACT,
    education: [],
    experience: [],
    projects: [],
    skillCategories: [],
  });

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
}

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

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Brand + action */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">ResumeFlow Labs</h1>
              <p className="text-xs text-zinc-400">Resume Builder</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Preview Resume →
            </button>
          </div>

          {/* Tab bar */}
          <nav className="flex overflow-x-auto" aria-label="Form sections">
            {TABS.map((tab) => {
              const count = sectionCounts[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
      </main>
    </div>
  );
}
