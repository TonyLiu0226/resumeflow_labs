import { RESUME_BULLET_GENERATOR_PROMPT } from "@/app/constants/constants";
import { getGeminiClient } from "../../server/gemini";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const { bullet } = await request.json();
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: bullet,
    config: {
      systemInstruction: RESUME_BULLET_GENERATOR_PROMPT,
    },
  });
  return NextResponse.json({ bullet: response.text });
}