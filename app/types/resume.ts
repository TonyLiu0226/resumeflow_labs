export interface ContactInfo {
  name: string;
  github: string;
  phone: string;
  email: string;
  linkedin: string;
}

export interface Education {
  id: string;
  schoolName: string;
  location: string;
  degree: string;
  dateAchieved: string;
  courses: string[];
}

export interface Experience {
  id: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  companyName: string;
  location: string;
  bulletPoints: string[];
}

export interface Project {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  githubLink: string;
  bulletPoints: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Set<string>;
}

export interface ResumeFormData {
  contact: ContactInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skillCategories: SkillCategory[];
}

// ─── API payload (JSON-safe: Set<string> → string[]) ──────────────────────────

export interface SkillCategoryPayload {
  name: string;
  skills: string[];
}

export interface ResumePayload {
  contact: ContactInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skillCategories: SkillCategoryPayload[];
}

export interface ResumeEducation {
  school: string;
  location: string;
  degree: string;
  dateAchieved: string;
  courses: string[];
}

export interface ResumeExperience {
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface ResumeProject {
  title: string;
  startDate: string;
  endDate: string;
  githubLink: string;
  bulletPoints: string[];
}

export interface ResumeSkillCategory {
  name: string;
  skills: string[];
}