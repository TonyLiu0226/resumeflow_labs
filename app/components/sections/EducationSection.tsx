"use client";
import { MAX_COURSES_PER_EDUCATION, MAX_EDUCATIONS } from "../../constants/constants";

import { useState, type KeyboardEvent } from "react";
import type { Education } from "../../types/resume";

const inputClass =
  "w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";

const labelClass = "block text-sm font-medium text-zinc-700 mb-1";

// ─── EducationItem ─────────────────────────────────────────────────────────────

interface ItemProps {
  education: Education;
  index: number;
  onUpdate: (id: string, updates: Partial<Education>) => void;
  onRemove: (id: string) => void;
}

function EducationItem({ education, index, onUpdate, onRemove }: ItemProps) {
  const [expanded, setExpanded] = useState(true);
  const [courseInput, setCourseInput] = useState("");

  const handleField = (
    field: keyof Omit<Education, "id" | "courses">,
    value: string
  ) => {
    onUpdate(education.id, { [field]: value });
  };

  const addCourse = () => {
    const trimmed = courseInput.trim();
    if (!trimmed || education.courses.length >= MAX_COURSES_PER_EDUCATION) return;
    onUpdate(education.id, { courses: [...education.courses, trimmed] });
    setCourseInput("");
  };

  const removeCourse = (idx: number) => {
    onUpdate(education.id, {
      courses: education.courses.filter((_, i) => i !== idx),
    });
  };

  const handleCourseKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCourse();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex justify-between w-full items-center gap-3 ml-3 mr-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(education.id);
            }}
            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-zinc-100 px-5 pb-5 space-y-5">
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>School Name</label>
              <input
                type="text"
                value={education.schoolName}
                onChange={(e) => handleField("schoolName", e.target.value)}
                placeholder="Massachusetts Institute of Technology"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={education.location}
                onChange={(e) => handleField("location", e.target.value)}
                placeholder="Cambridge, MA"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Degree / Diploma</label>
              <input
                type="text"
                value={education.degree}
                onChange={(e) => handleField("degree", e.target.value)}
                placeholder="B.S. Computer Science"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date Achieved</label>
              <input
                type="text"
                value={education.dateAchieved}
                onChange={(e) => handleField("dateAchieved", e.target.value)}
                placeholder="May 2024"
                className={inputClass}
              />
            </div>
          </div>

          {/* Courses */}
          <div>
            <label className={labelClass}>
              Relevant Courses{" "}
              <span className="font-normal text-zinc-400">
                ({education.courses.length}/{MAX_COURSES_PER_EDUCATION})
              </span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                onKeyDown={handleCourseKeyDown}
                placeholder="e.g. Algorithms, Data Structures…"
                disabled={education.courses.length >= MAX_COURSES_PER_EDUCATION}
                className={`flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={addCourse}
                disabled={!courseInput.trim() || education.courses.length >= MAX_COURSES_PER_EDUCATION}
                className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            {education.courses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {education.courses.map((course, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => removeCourse(idx)}
                      className="text-blue-400 hover:text-blue-700 transition-colors leading-none"
                      aria-label={`Remove ${course}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EducationSection ──────────────────────────────────────────────────────────

interface Props {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Education>) => void;
  onRemove: (id: string) => void;
}

export default function EducationSection({
  education,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Education</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {education.length} / {MAX_EDUCATIONS} entries
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={education.length >= MAX_EDUCATIONS}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 py-16 text-center">
          <div className="text-5xl mb-3">🎓</div>
          <p className="text-zinc-500 text-sm">
            No education added yet.{" "}
            <button
              type="button"
              onClick={onAdd}
              className="text-blue-600 hover:underline"
            >
              Add your first entry
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu, idx) => (
            <EducationItem
              key={edu.id}
              education={edu}
              index={idx}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
      <button
          type="button"
          onClick={onAdd}
          disabled={education.length >= MAX_EDUCATIONS}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Education
        </button>
    </div>
  );
}
