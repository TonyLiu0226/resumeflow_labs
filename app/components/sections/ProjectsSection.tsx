"use client";

import { useState, type KeyboardEvent } from "react";
import type { Project } from "../../types/resume";
import { MAX_BULLETS_PER_PROJECT, MAX_PROJECTS } from "../../constants/constants";
import Image from "next/image";

const inputClass =
  "w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";

const labelClass = "block text-sm font-medium text-zinc-700 mb-1";

// ─── BulletPointList ───────────────────────────────────────────────────────────

interface BulletListProps {
  bullets: string[];
  onUpdate: (bullets: string[]) => void;
  max: number;
}

function BulletPointList({ bullets, onUpdate, max }: BulletListProps) {
  const [input, setInput] = useState("");
  const [isGeneratingBullet, setIsGeneratingBullet] = useState(false);

  const addBullet = () => {
    const trimmed = input.trim();
    if (!trimmed || bullets.length >= max) return;
    onUpdate([...bullets, trimmed]);
    setInput("");
  };

  const generateBullet = async () => {
    setIsGeneratingBullet(true);
    const result = await fetch("/api/project-bullets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bullet: input }),
    });
    const data = await result.json();
    if (!result.ok) {
      setIsGeneratingBullet(false);
      return;
    }
    setInput(typeof data?.bullet === "string" ? data.bullet : String(data?.bullet ?? ""));
    setIsGeneratingBullet(false);
  };

  const removeBullet = (idx: number) => {
    onUpdate(bullets.filter((_, i) => i !== idx));
  };

  const updateBullet = (idx: number, value: string) => {
    onUpdate(bullets.map((b, i) => (i === idx ? value : b)));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addBullet();
    }
  };

  return (
    <div>
      <label className={labelClass}>
        Bullet Points{" "}
        <span className="font-normal text-zinc-400">
          ({bullets.length}/{max})
        </span>
      </label>

      {bullets.length > 0 && (
        <ul className="space-y-2 mb-3">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-2 text-zinc-400 shrink-0">•</span>
              <textarea
                value={bullet}
                onChange={(e) => updateBullet(idx, e.target.value)}
                rows={2}
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
              <button
                type="button"
                onClick={() => removeBullet(idx)}
                className="cursor-pointer mt-1.5 text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors shrink-0"
                aria-label="Remove bullet"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {bullets.length < max && (
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a feature or accomplishment… (Enter to add)"
            rows={2}
            className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
          <button
            type="button"
            onClick={addBullet}
            disabled={typeof input !== "string" || !input.trim()}
            className="cursor-pointer self-end px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={generateBullet}
            disabled={typeof input !== "string" || !input.trim() || isGeneratingBullet}
            className="cursor-pointer self-end px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          > 
            <span><Image src="/ai.png" alt="AI" className="w-4 h-4" width={8} height={8} /></span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ProjectItem ───────────────────────────────────────────────────────────────

interface ItemProps {
  project: Project;
  index: number;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onRemove: (id: string) => void;
}

function ProjectItem({ project, index, onUpdate, onRemove }: ItemProps) {
  const [expanded, setExpanded] = useState(true);

  const handleField = (
    field: keyof Omit<Project, "id" | "bulletPoints">,
    value: string
  ) => {
    onUpdate(project.id, { [field]: value });
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
              onRemove(project.id);
            }}
            className="cursor-pointer text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
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
            <div className="sm:col-span-2">
              <label className={labelClass}>Project Title</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => handleField("title", e.target.value)}
                placeholder="My Awesome Project"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Start Date{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                type="text"
                value={project.startDate}
                onChange={(e) => handleField("startDate", e.target.value)}
                placeholder="Jan 2023"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                End Date{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                type="text"
                value={project.endDate}
                onChange={(e) => handleField("endDate", e.target.value)}
                placeholder="Mar 2023"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>GitHub Link</label>
              <input
                type="url"
                value={project.githubLink}
                onChange={(e) => handleField("githubLink", e.target.value)}
                placeholder="https://github.com/username/project"
                className={inputClass}
              />
            </div>
          </div>

          <BulletPointList
            bullets={project.bulletPoints}
            onUpdate={(bullets) => onUpdate(project.id, { bulletPoints: bullets })}
            max={MAX_BULLETS_PER_PROJECT}
          />
        </div>
      )}
    </div>
  );
}

// ─── ProjectsSection ───────────────────────────────────────────────────────────

interface Props {
  projects: Project[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onRemove: (id: string) => void;
}

export default function ProjectsSection({
  projects,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Projects</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {projects.length} / {MAX_PROJECTS} entries
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={projects.length >= MAX_PROJECTS}
          className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 py-16 text-center">
          <div className="text-5xl mb-3">🚀</div>
          <p className="text-zinc-500 text-sm">
            No projects added yet.{" "}
            <button
              type="button"
              onClick={onAdd}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Add your first project
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, idx) => (
            <ProjectItem
              key={project.id}
              project={project}
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
          disabled={projects.length >= MAX_PROJECTS}
          className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Project
        </button>
    </div>
  );
}
