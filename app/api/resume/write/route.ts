import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { buildLatex } from "../../../utils/latexBuilder";
import type { ResumePayload } from "../../../types/resume";

export async function POST(request: NextRequest) {
  try {
    const payload: ResumePayload = await request.json();

    const latex = buildLatex(payload);

    const id = randomUUID();
    const dir = join(tmpdir(), "resumeflow", id);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "resume.tex"), latex, "utf-8");

    return NextResponse.json({ id, latex });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate LaTeX: ${message}` },
      { status: 500 }
    );
  }
}
