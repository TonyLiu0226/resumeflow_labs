"use client";

import { useState, type KeyboardEvent } from "react";
import type { SkillCategory } from "../../types/resume";
import { MAX_SKILLS_PER_CATEGORY, MAX_TOTAL_SKILLS, MAX_CATEGORIES } from "../../constants/constants";

// ─── CategoryCard ──────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: SkillCategory;
  index: number;
  totalSkills: number;
  onUpdate: (id: string, updates: Partial<SkillCategory>) => void;
  onRemove: (id: string) => void;
}

function CategoryCard({
  category,
  index,
  totalSkills,
  onUpdate,
  onRemove,
}: CategoryCardProps) {
  const [skillInput, setSkillInput] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  const atSkillCap = category.skills.size >= MAX_SKILLS_PER_CATEGORY;
  const atTotalCap = totalSkills >= MAX_TOTAL_SKILLS;
  const canAddSkill = !atSkillCap && !atTotalCap;

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || !canAddSkill) return;

    if (category.skills.has(trimmed)) {
      setIsDuplicate(true);
      return;
    }

    onUpdate(category.id, {
      skills: new Set([...category.skills, trimmed]),
    });
    setSkillInput("");
    setIsDuplicate(false);
  };

  const removeSkill = (skill: string) => {
    const next = new Set(category.skills);
    next.delete(skill);
    onUpdate(category.id, { skills: next });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleInputChange = (value: string) => {
    setSkillInput(value);
    if (isDuplicate) setIsDuplicate(false);
  };

  const title = category.name || `Category ${index + 1}`;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-zinc-50">
        <input
          type="text"
          value={category.name}
          onChange={(e) => onUpdate(category.id, { name: e.target.value })}
          placeholder={`Category ${index + 1} name…`}
          className="flex-1 px-3 py-1.5 border border-zinc-300 rounded-lg text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
        />
        <span className="text-xs text-zinc-400 shrink-0 whitespace-nowrap">
          {category.skills.size} / {MAX_SKILLS_PER_CATEGORY}
        </span>
        <button
          type="button"
          onClick={() => onRemove(category.id)}
          className="shrink-0 text-xs text-red-500 hover:text-red-700 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Skills body */}
      <div className="px-5 py-4 space-y-4">
        {/* Skill chips */}
        {category.skills.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {[...category.skills].map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-blue-400 hover:text-blue-700 transition-colors leading-none"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">
            No skills yet — add one below.
          </p>
        )}

        {/* Add skill input */}
        <div className="space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                atSkillCap
                  ? `Limit of ${MAX_SKILLS_PER_CATEGORY} skills reached`
                  : atTotalCap
                    ? `Total skill limit (${MAX_TOTAL_SKILLS}) reached`
                    : `Add a skill to "${title}"…`
              }
              disabled={!canAddSkill}
              className={`flex-1 px-3 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDuplicate
                  ? "border-red-400 focus:ring-red-400 bg-red-50"
                  : "border-zinc-300 focus:ring-blue-500"
              }`}
            />
            <button
              type="button"
              onClick={addSkill}
              disabled={!skillInput.trim() || !canAddSkill}
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          {isDuplicate && (
            <p className="text-xs text-red-600">
              &ldquo;{skillInput.trim()}&rdquo; is already in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SkillsSection ─────────────────────────────────────────────────────────────

interface Props {
  skillCategories: SkillCategory[];
  onAddCategory: () => void;
  onUpdateCategory: (id: string, updates: Partial<SkillCategory>) => void;
  onRemoveCategory: (id: string) => void;
}

export default function SkillsSection({
  skillCategories,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
}: Props) {
  const totalSkills = skillCategories.reduce(
    (sum, cat) => sum + cat.skills.size,
    0
  );
  const atCategoryLimit = skillCategories.length >= MAX_CATEGORIES;
  const atTotalSkillLimit = totalSkills >= MAX_TOTAL_SKILLS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Skills</h2>
          <p className="text-sm text-zinc-500 mt-1">
            <span className={atCategoryLimit ? "text-amber-600 font-medium" : ""}>
              {skillCategories.length} / {MAX_CATEGORIES} categories
            </span>
            {" · "}
            <span className={atTotalSkillLimit ? "text-amber-600 font-medium" : ""}>
              {totalSkills} / {MAX_TOTAL_SKILLS} total skills
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCategory}
          disabled={atCategoryLimit}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Category
        </button>
      </div>

      {/* Limit banners */}
      {atCategoryLimit && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          Maximum of {MAX_CATEGORIES} categories reached.
        </div>
      )}
      {atTotalSkillLimit && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          Maximum of {MAX_TOTAL_SKILLS} total skills reached across all categories.
        </div>
      )}

      {/* Empty state */}
      {skillCategories.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 py-16 text-center">
          <div className="text-5xl mb-3">⚡</div>
          <p className="text-zinc-500 text-sm">
            Start by{" "}
            <button
              type="button"
              onClick={onAddCategory}
              className="text-blue-600 hover:underline"
            >
              creating a category
            </button>
            , then add skills to it.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {skillCategories.map((cat, idx) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              index={idx}
              totalSkills={totalSkills}
              onUpdate={onUpdateCategory}
              onRemove={onRemoveCategory}
            />
          ))}
        </div>
      )}
      <button
          type="button"
          onClick={onAddCategory}
          disabled={atCategoryLimit}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Category
        </button>
    </div>
  );
}
