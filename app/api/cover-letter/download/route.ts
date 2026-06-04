import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execFileAsync = promisify(execFile);

function resolvePdflatexPath(): string | null {
  const directCandidates = ["/usr/bin/pdflatex", "/usr/local/bin/pdflatex"];
  for (const p of directCandidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    } catch {
      // ignore
    }
  }

  // Common TeX Live installs under /usr/local/texlive/<year>/bin/<arch>/pdflatex
  const texliveBase = "/usr/local/texlive";
  try {
    if (!fs.existsSync(texliveBase)) return null;
    const entries = fs.readdirSync(texliveBase, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const binRoot = join(texliveBase, entry.name, "bin");
      if (!fs.existsSync(binRoot)) continue;

      const archEntries = fs.readdirSync(binRoot, { withFileTypes: true });
      for (const archEntry of archEntries) {
        if (!archEntry.isDirectory()) continue;
        const pdflatexPath = join(binRoot, archEntry.name, "pdflatex");
        try {
          if (fs.existsSync(pdflatexPath) && fs.statSync(pdflatexPath).isFile()) {
            return pdflatexPath;
          }
        } catch {
          // ignore
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

function escapeLatex(text: string) {
  // Replace some common characters to prevent latex compilation errors
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    // We treat double newline as paragraph break, single newline as line break
    .replace(/\n\n/g, '\\par\n\n')
    .replace(/(?<!\n)\n(?!\n)/g, '\\\\ ');
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const latex = `
\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{1em}
\\begin{document}
${escapeLatex(content)}
\\end{document}
`;

    const id = randomUUID();
    const dir = join(tmpdir(), "resumeflow_cl", id);
    await mkdir(dir, { recursive: true });
    const texPath = join(dir, "cover_letter.tex");
    const pdfPath = join(dir, "cover_letter.pdf");
    
    await writeFile(texPath, latex, "utf-8");

    const pdflatexPath = resolvePdflatexPath();
    if (!pdflatexPath) {
      throw new Error("pdflatex not found.");
    }

    await execFileAsync(
      pdflatexPath,
      ["-interaction=nonstopmode", `-output-directory=${dir}`, texPath],
      { timeout: 30_000, env: process.env }
    );

    const pdf = await readFile(pdfPath);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cover_letter.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
