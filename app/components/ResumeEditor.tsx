"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// ─── Shared type (imported by KeywordAnalysis) ──────────────────────────────

export interface KeywordResult {
  keyword: string;
  importance: "High" | "Medium" | "Low";
  found: boolean;
}

// ─── API response types (mirrors /api/resume/load) ──────────────────────────

interface RawContact {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
}

interface RawCourse { name: string }

interface RawEducation {
  id: string;
  school: string;
  location: string;
  degree: string;
  dateAchieved: string;
  courses: RawCourse[];
}

interface RawBullet { content: string }

interface RawExperience {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: RawBullet[];
}

interface RawProject {
  id: string;
  projectTitle: string;
  github: string;
  projectStart: string;
  projectEnd: string;
  bullets: RawBullet[];
}

interface RawSkillItem { name: string }

interface RawSkillCategory {
  id: string;
  name: string;
  items: RawSkillItem[];
}

interface RawSkills { categories: RawSkillCategory[] }

interface ResumeData {
  id: string;
  name: string;
  contact: RawContact | null;
  education: RawEducation[];
  experience: RawExperience[];
  projects: RawProject[];
  skills: RawSkills | null;
}

// ─── Highlight helpers ───────────────────────────────────────────────────────

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renders text with any matching keywords highlighted in amber.
 * Uses the original (non-normalized) keyword strings for display matching.
 */
function HighlightedText({
  text,
  keywords,
}: {
  text: string;
  keywords: KeywordResult[];
}) {
  if (!text) return null;

  const kwList = keywords
    .filter((k) => k.keyword.trim().length > 0)
    .sort((a, b) => b.keyword.length - a.keyword.length);

  if (kwList.length === 0) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  const pattern = kwList.map((k) => escapeRegex(k.keyword)).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (!part) return null;
        const hit = kwList.find(
          (k) => k.keyword.toLowerCase() === part.toLowerCase()
        );
        if (hit) {
          return (
            <mark
              key={i}
              className="bg-amber-200 text-amber-900 rounded-sm px-0.5 font-medium not-italic"
            >
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ─── EditableField ───────────────────────────────────────────────────────────

function EditableField({
  value,
  keywords,
  onChange,
  multiline = false,
  placeholder,
  textClass = "",
}: {
  value: string;
  keywords: KeywordResult[];
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  textClass?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  if (editing) {
    const shared =
      "w-full px-2 py-1 border border-blue-400 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900";

    if (multiline) {
      return (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          rows={Math.max(2, Math.ceil(draft.length / 70))}
          className={`${shared} text-sm resize-y`}
        />
      );
    }

    return (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`${shared} text-sm`}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setDraft(value);
          setEditing(true);
        }
      }}
      title="Click to edit"
      className={`block w-full px-1 py-0.5 rounded cursor-text hover:outline hover:outline-2 hover:outline-blue-300 hover:bg-blue-50/50 transition-colors ${textClass}`}
    >
      {value ? (
        <HighlightedText text={value} keywords={keywords} />
      ) : (
        <span className="text-zinc-400 italic text-sm">
          {placeholder ?? "Click to add…"}
        </span>
      )}
    </span>
  );
}

// ─── SkillCategoryEditor ─────────────────────────────────────────────────────

function SkillCategoryEditor({
  category,
  keywords,
  onUpdate,
}: {
  category: RawSkillCategory;
  keywords: KeywordResult[];
  onUpdate: (cat: RawSkillCategory) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    category.items.map((i) => i.name).join(", ")
  );

  useEffect(() => {
    setDraft(category.items.map((i) => i.name).join(", "));
  }, [category]);

  function commit() {
    const skills = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdate({ ...category, items: skills.map((name) => ({ name })) });
    setEditing(false);
  }

  if (editing) {
    return (
      <div>
        <p className="text-xs text-zinc-500 mb-1">
          Comma-separated — press Escape or click away to save
        </p>
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") commit();
          }}
          rows={3}
          className="w-full px-2 py-1.5 border border-blue-400 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-zinc-900"
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 cursor-text min-h-[28px] hover:bg-blue-50/50 hover:outline hover:outline-2 hover:outline-blue-300 rounded-md p-1 transition-colors"
      onClick={() => setEditing(true)}
      title="Click to edit skills"
    >
      {category.items.length === 0 ? (
        <span className="text-zinc-400 italic text-sm">Click to add skills…</span>
      ) : (
        category.items.map((item, i) => {
          const matched = keywords.some(
            (k) => k.keyword.toLowerCase() === item.name.toLowerCase()
          );
          return (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                matched
                  ? "bg-amber-200 text-amber-900 ring-1 ring-amber-400"
                  : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {item.name}
            </span>
          );
        })
      )}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 mt-6 first:mt-0">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface ResumeEditorProps {
  resumeId: string | null;
  keywords: KeywordResult[];
}

export default function ResumeEditor({ resumeId, keywords }: ResumeEditorProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle"
  );

  // ── Load resume whenever ID changes ────────────────────────────────────────

  const loadResume = useCallback(async (id: string) => {
    setIsLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/resume/load?id=${id}`);
      if (!res.ok) throw new Error("load failed");
      setData(await res.json());
    } catch {
      /* leave data null — editor shows error state */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    } else {
      setData(null);
    }
  }, [resumeId, loadResume]);

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!data || !session?.user?.id) return;
    setIsSaving(true);
    setSaveStatus("idle");

    const payload = {
      userId: session.user.id,
      resumeId: data.id,
      name: data.name,
      contact: {
        name: data.contact?.name ?? "",
        email: data.contact?.email ?? "",
        phone: data.contact?.phone ?? "",
        github: data.contact?.github ?? "",
        linkedin: data.contact?.linkedin ?? "",
      },
      education: data.education.map((edu) => ({
        school: edu.school,
        location: edu.location,
        degree: edu.degree,
        dateAchieved: edu.dateAchieved,
        courses: edu.courses.map((c) => c.name),
      })),
      experience: data.experience.map((exp) => ({
        jobTitle: exp.jobTitle,
        companyName: exp.companyName,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        bulletPoints: exp.bullets.map((b) => b.content),
      })),
      projects: data.projects.map((proj) => ({
        title: proj.projectTitle,
        startDate: proj.projectStart,
        endDate: proj.projectEnd,
        githubLink: proj.github,
        bulletPoints: proj.bullets.map((b) => b.content),
      })),
      skillCategories:
        data.skills?.categories.map((cat) => ({
          name: cat.name,
          skills: cat.items.map((i) => i.name),
        })) ?? [],
    };

    try {
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Updaters ───────────────────────────────────────────────────────────────

  function setContact(field: keyof RawContact, value: string) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            contact: { ...(prev.contact ?? emptyContact()), [field]: value },
          }
        : prev
    );
  }

  function setExpField(
    idx: number,
    field: keyof Omit<RawExperience, "bullets" | "id">,
    value: string
  ) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            experience: prev.experience.map((e, i) =>
              i === idx ? { ...e, [field]: value } : e
            ),
          }
        : prev
    );
  }

  function setExpBullet(expIdx: number, bulletIdx: number, value: string) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            experience: prev.experience.map((e, i) =>
              i === expIdx
                ? {
                    ...e,
                    bullets: e.bullets.map((b, j) =>
                      j === bulletIdx ? { content: value } : b
                    ),
                  }
                : e
            ),
          }
        : prev
    );
  }

  function setEduField(
    idx: number,
    field: keyof Omit<RawEducation, "courses" | "id">,
    value: string
  ) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            education: prev.education.map((e, i) =>
              i === idx ? { ...e, [field]: value } : e
            ),
          }
        : prev
    );
  }

  function setProjField(
    idx: number,
    field: keyof Omit<RawProject, "bullets" | "id">,
    value: string
  ) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((p, i) =>
              i === idx ? { ...p, [field]: value } : p
            ),
          }
        : prev
    );
  }

  function setProjBullet(projIdx: number, bulletIdx: number, value: string) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((p, i) =>
              i === projIdx
                ? {
                    ...p,
                    bullets: p.bullets.map((b, j) =>
                      j === bulletIdx ? { content: value } : b
                    ),
                  }
                : p
            ),
          }
        : prev
    );
  }

  function setSkillCategory(idx: number, cat: RawSkillCategory) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            skills: {
              categories: (prev.skills?.categories ?? []).map((c, i) =>
                i === idx ? cat : c
              ),
            },
          }
        : prev
    );
  }

  // ── Empty placeholder states ───────────────────────────────────────────────

  if (!resumeId) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-500">
          Select a resume to start editing
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Run an analysis to see keyword highlights
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-24">
        <svg
          className="animate-spin h-6 w-6 text-zinc-400"
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
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center py-24">
        <p className="text-sm text-red-500">Failed to load resume.</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-zinc-100 bg-zinc-50">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={data.name}
            onChange={(e) =>
              setData((prev) =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
            className="text-sm font-semibold text-zinc-900 bg-transparent border-none outline-none w-full truncate focus:ring-0"
            placeholder="Resume name"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {keywords.length > 0 && (
            <p className="text-xs text-zinc-400 hidden sm:block">
              <span className="text-amber-600 font-medium">■</span> = keyword
              match
            </p>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600 font-medium">✓ Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-600 font-medium">Save failed</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-3 w-3"
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
                Saving…
              </>
            ) : (
              "Save Resume"
            )}
          </button>
        </div>
      </div>

      {/* Document body */}
      <div className="p-6 space-y-6 overflow-y-auto text-sm text-zinc-800">
        {/* ── Contact ────────────────────────────────────────────────────────── */}
        <Section title="Contact">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {(
              [
                ["name", "Full Name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["github", "GitHub"],
                ["linkedin", "LinkedIn"],
              ] as [keyof RawContact, string][]
            ).map(([field, label]) => (
              <div key={field}>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <EditableField
                  value={data.contact?.[field] ?? ""}
                  keywords={keywords}
                  onChange={(v) => setContact(field, v)}
                  placeholder={`Add ${label.toLowerCase()}…`}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Experience ─────────────────────────────────────────────────────── */}
        {data.experience.length > 0 && (
          <Section title="Work Experience">
            {data.experience.map((exp, ei) => (
              <div
                key={exp.id}
                className="border border-zinc-100 rounded-lg p-4 space-y-2"
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Job Title
                    </p>
                    <EditableField
                      value={exp.jobTitle}
                      keywords={keywords}
                      onChange={(v) => setExpField(ei, "jobTitle", v)}
                      textClass="font-semibold"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Company
                    </p>
                    <EditableField
                      value={exp.companyName}
                      keywords={keywords}
                      onChange={(v) => setExpField(ei, "companyName", v)}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Location
                    </p>
                    <EditableField
                      value={exp.location}
                      keywords={keywords}
                      onChange={(v) => setExpField(ei, "location", v)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                        Start
                      </p>
                      <EditableField
                        value={exp.startDate}
                        keywords={[]}
                        onChange={(v) => setExpField(ei, "startDate", v)}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                        End
                      </p>
                      <EditableField
                        value={exp.endDate}
                        keywords={[]}
                        onChange={(v) => setExpField(ei, "endDate", v)}
                      />
                    </div>
                  </div>
                </div>
                {exp.bullets.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-2">
                      Bullet Points
                    </p>
                    <ul className="space-y-1.5">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-1.5">
                          <span className="text-zinc-400 mt-1 shrink-0">•</span>
                          <EditableField
                            value={b.content}
                            keywords={keywords}
                            onChange={(v) => setExpBullet(ei, bi, v)}
                            multiline
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* ── Education ──────────────────────────────────────────────────────── */}
        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((edu, ei) => (
              <div
                key={edu.id}
                className="border border-zinc-100 rounded-lg p-4 space-y-1"
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {(
                    [
                      ["school", "School"],
                      ["degree", "Degree"],
                      ["location", "Location"],
                      ["dateAchieved", "Graduation"],
                    ] as [keyof Omit<RawEducation, "courses" | "id">, string][]
                  ).map(([field, label]) => (
                    <div key={field}>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      <EditableField
                        value={edu[field]}
                        keywords={keywords}
                        onChange={(v) => setEduField(ei, field, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* ── Projects ───────────────────────────────────────────────────────── */}
        {data.projects.length > 0 && (
          <Section title="Projects">
            {data.projects.map((proj, pi) => (
              <div
                key={proj.id}
                className="border border-zinc-100 rounded-lg p-4 space-y-2"
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Title
                    </p>
                    <EditableField
                      value={proj.projectTitle}
                      keywords={keywords}
                      onChange={(v) => setProjField(pi, "projectTitle", v)}
                      textClass="font-semibold"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      GitHub
                    </p>
                    <EditableField
                      value={proj.github}
                      keywords={[]}
                      onChange={(v) => setProjField(pi, "github", v)}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Start
                    </p>
                    <EditableField
                      value={proj.projectStart}
                      keywords={[]}
                      onChange={(v) => setProjField(pi, "projectStart", v)}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      End
                    </p>
                    <EditableField
                      value={proj.projectEnd}
                      keywords={[]}
                      onChange={(v) => setProjField(pi, "projectEnd", v)}
                    />
                  </div>
                </div>
                {proj.bullets.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-2">
                      Bullet Points
                    </p>
                    <ul className="space-y-1.5">
                      {proj.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-1.5">
                          <span className="text-zinc-400 mt-1 shrink-0">•</span>
                          <EditableField
                            value={b.content}
                            keywords={keywords}
                            onChange={(v) => setProjBullet(pi, bi, v)}
                            multiline
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* ── Skills ─────────────────────────────────────────────────────────── */}
        {(data.skills?.categories?.length ?? 0) > 0 && (
          <Section title="Skills">
            {data.skills!.categories.map((cat, ci) => (
              <div key={cat.id}>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  {cat.name}
                </p>
                <SkillCategoryEditor
                  category={cat}
                  keywords={keywords}
                  onUpdate={(updated) => setSkillCategory(ci, updated)}
                />
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function emptyContact(): RawContact {
  return { name: "", email: "", phone: "", github: "", linkedin: "" };
}
