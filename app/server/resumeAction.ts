"use server";

import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import { buildLatex } from "../utils/latexBuilder";
import type { ResumePayload } from "../types/resume";

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

export async function generatePdfBuffer(payload: ResumePayload): Promise<{ buffer: Buffer, id: string }> {
  const latex = buildLatex(payload);

  const id = randomUUID();
  const dir = join(tmpdir(), "resumeflow", id);
  await mkdir(dir, { recursive: true });
  const texPath = join(dir, "resume.tex");
  const pdfPath = join(dir, "resume.pdf");
  
  await writeFile(texPath, latex, "utf-8");

  const pdflatexPath = resolvePdflatexPath();
  if (!pdflatexPath) {
    throw new Error("pdflatex not found. Install TeX Live and ensure it is available under /usr/local/texlive (or /usr/bin).");
  }

  await execFileAsync(
    pdflatexPath,
    ["-interaction=nonstopmode", `-output-directory=${dir}`, texPath],
    { timeout: 30_000, env: process.env }
  );

  const pdf = await readFile(pdfPath);
  return { buffer: pdf, id };
}
