import { RESUME_PARSE_PROMPT } from "@/app/constants/constants";
import { getGroqClient } from "../../server/gemini";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const { resumeText } = await request.json();
  const ai = getGroqClient();
  const response = await ai.chat.completions.create({
    "messages": [
      {
        "role": "system",
        "content": RESUME_PARSE_PROMPT
      },
      {
        "role": "user",
        "content": resumeText
      }
    ],
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.1,
    "max_completion_tokens": 2500,
    "top_p": 1,
    "stream": false,
    "stop": null
  });

  return NextResponse.json({ resume: response.choices[0].message.content });
}