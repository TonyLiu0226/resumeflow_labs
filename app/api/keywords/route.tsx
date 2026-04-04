import { KEYWORD_TAILORING_PROMPT } from "@/app/constants/constants";
import { getGroqClient } from "../../server/gemini";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const { job } = await request.json();
  const ai = getGroqClient();
  const response = await ai.chat.completions.create({
    "messages": [
      {
        "role": "system",
        "content": KEYWORD_TAILORING_PROMPT
      },
      {
        "role": "user",
        "content": job
      }
    ],
    "model": "meta-llama/llama-4-scout-17b-16e-instruct",
    "temperature": 0.2,
    "max_completion_tokens": 1024,
    "top_p": 1,
    "stream": false,
    "stop": null
  });

  console.log(response.choices[0].message.content);
  return NextResponse.json({ bullet: response.choices[0].message.content });
}