import { PROJECT_BULLET_GENERATOR_PROMPT } from "@/app/constants/constants";
import { getGroqClient } from "../../server/gemini";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const { bullet } = await request.json();
  const ai = getGroqClient();
  const response = await ai.chat.completions.create({
    "messages": [
      {
        "role": "system",
        "content": PROJECT_BULLET_GENERATOR_PROMPT
      },
      {
        "role": "user",
        "content": bullet
      }
    ],
    "model": "groq/compound",
    "temperature": 0.5,
    "max_completion_tokens": 8192,
    "top_p": 1,
    "stream": false,
    "stop": null
  });

  return NextResponse.json({ bullet: response.choices[0].message.content });
}
