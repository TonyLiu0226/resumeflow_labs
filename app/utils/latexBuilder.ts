import { escapeLatex } from "./sanitizer";
import type { ResumePayload } from "../types/resume";

// ─── LaTeX preamble (Jake's Resume template) ──────────────────────────────────

const PREAMBLE = String.raw`%-------------------------
% Resume in LaTeX — Jake's Resume Template
%-------------------------
\documentclass[letterpaper,10pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.6in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-6pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-9pt}]

\pdfgentounicode=1

%--- Custom commands ---
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{1pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.025in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}\vspace{-10pt}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=0.1in, rightmargin=0.1in]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-4pt}}
`;

// ─── Section builders ─────────────────────────────────────────────────────────

function buildHeading(contact: ResumePayload["contact"]): string {
  const parts: string[] = [];
  let name: string = "";
  if (contact.name) {
    name = contact.name;
  }
  if (contact.phone) {
    parts.push(`\\small Phone: ${escapeLatex(contact.phone)}`);
  }
  if (contact.email) {
    parts.push(
      `\\href{mailto:${contact.email}}Email: {\\underline{${escapeLatex(contact.email)}}}`
    );
  }
  if (contact.linkedin) {
    const display = contact.linkedin
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    parts.push(
      `\\href{${contact.linkedin}}LinkedIn: {\\underline{${escapeLatex(display)}}}`
    );
  }
  if (contact.github) {
    const display = contact.github
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    parts.push(
      `\\href{${contact.github}}GitHub: {\\underline{${escapeLatex(display)}}}`
    );
  }
  let latex: string = ``;
  if (name) {
    latex += `\\begin{center}\\textbf{\\Huge \\scshape ${escapeLatex(name)}} \\\\ \\vspace{1pt}\\end{center}`;
  }
  if (parts.length > 0) {
    latex += `\\begin{center}`
    latex += `${parts.join(" $|$ ")}`
    latex += `\\end{center}`
  }
  return latex;
}

function buildEducation(entries: ResumePayload["education"]): string {
  if (entries.length === 0) return "";

  const items = entries.map((edu) => {
    let block = `    \\resumeSubheading
      {${escapeLatex(edu.schoolName)}}{${escapeLatex(edu.location)}}
      {${escapeLatex(edu.degree)}}{${escapeLatex(edu.dateAchieved)}}`;

    if (edu.courses.length > 0) {
      const courseList = edu.courses.map(escapeLatex).join(", ");
      block += `
      \\resumeItemListStart
        \\resumeItem{Relevant Coursework: ${courseList}}
      \\resumeItemListEnd`;
    }

    return block;
  });

  return `\\section{Education}
  \\resumeSubHeadingListStart
${items.join("\n")}
  \\resumeSubHeadingListEnd`;
}

function buildExperience(entries: ResumePayload["experience"]): string {
  if (entries.length === 0) return "";

  const items = entries.map((exp) => {
    const dateRange = [exp.startDate, exp.endDate]
      .filter(Boolean)
      .join(" -- ");

    let block = `    \\resumeSubheading
      {${escapeLatex(exp.jobTitle)}}{${escapeLatex(dateRange)}}
      {${escapeLatex(exp.companyName)}}{${escapeLatex(exp.location)}}`;

    if (exp.bulletPoints.length > 0) {
      const bullets = exp.bulletPoints
        .map((b) => `        \\resumeItem{${escapeLatex(b)}}`)
        .join("\n");
      block += `
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
    }

    return block;
  });

  return `\\section{Experience}
  \\resumeSubHeadingListStart
${items.join("\n")}
  \\resumeSubHeadingListEnd`;
}

function buildProjects(entries: ResumePayload["projects"]): string {
  if (entries.length === 0) return "";

  const items = entries.map((proj) => {
    const dateRange = [proj.startDate, proj.endDate]
      .filter(Boolean)
      .join(" -- ");

    let heading = `\\textbf{${escapeLatex(proj.title)}}`;
    if (proj.githubLink) {
      heading += ` $|$ \\href{${proj.githubLink}}{\\underline{GitHub}}`;
    }

    let block = `    \\resumeProjectHeading
      {${heading}}{${escapeLatex(dateRange)}}`;

    if (proj.bulletPoints.length > 0) {
      const bullets = proj.bulletPoints
        .map((b) => `        \\resumeItem{${escapeLatex(b)}}`)
        .join("\n");
      block += `
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
    }

    return block;
  });

  return `\\section{Projects}
  \\resumeSubHeadingListStart
${items.join("\n")}
  \\resumeSubHeadingListEnd`;
}

function buildSkills(
  categories: ResumePayload["skillCategories"]
): string {
  const filled = categories.filter(
    (cat) => cat.name && cat.skills.length > 0
  );
  if (filled.length === 0) return "";

  const lines = filled.map((cat) => {
    const skillList = cat.skills.map(escapeLatex).join(", ");
    return `     \\textbf{${escapeLatex(cat.name)}}{: ${skillList}}`;
  });

  return `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${lines.join(" \\\\\n")}
    }}
 \\end{itemize}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildLatex(payload: ResumePayload): string {
  const sections = [
    buildHeading(payload.contact),
    buildEducation(payload.education),
    buildExperience(payload.experience),
    buildProjects(payload.projects),
    buildSkills(payload.skillCategories),
  ].filter(Boolean);

  return `${PREAMBLE}
\\begin{document}

${sections.join("\n\n")}

\\end{document}
`;
}
