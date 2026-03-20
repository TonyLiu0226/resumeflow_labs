import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { readFile, access } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

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

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (typeof id !== "string" || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
    }

    const dir = join(tmpdir(), "resumeflow", id);
    const texPath = join(dir, "resume.tex");
    const pdfPath = join(dir, "resume.pdf");

    try {
      await access(texPath);
    } catch {
      return NextResponse.json(
        { error: "Resume not found — call /api/resume/write first" },
        { status: 404 }
      );
    }
    console.log("Rendering PDF...");
    console.log(texPath);
    console.log(dir);

    const pdflatexPath = resolvePdflatexPath();
    if (!pdflatexPath) {
      return NextResponse.json(
        {
          error:
            "pdflatex not found. Install TeX Live and ensure it is available under /usr/local/texlive (or /usr/bin).",
        },
        { status: 500 }
      );
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
        "Content-Disposition": 'inline; filename="resume.pdf"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to render PDF: ${message}` },
      { status: 500 }
    );
  }
}
