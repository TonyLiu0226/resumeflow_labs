import { NextRequest, NextResponse } from "next/server";
import { analyzeKeywords } from "../../server/keywordsAction";

export async function POST(request: NextRequest) {
  const { job } = await request.json();
  if (!job || typeof job !== "string") {
    return NextResponse.json(
      { error: "A job description is required" },
      { status: 400 }
    );
  }
  try {
    const raw = await analyzeKeywords(job);
    return NextResponse.json({ result: raw });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}