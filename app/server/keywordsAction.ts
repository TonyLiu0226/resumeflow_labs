"use server";

import { KEYWORD_TAILORING_PROMPT } from "@/app/constants/constants";
import { getGroqClient } from "./gemini";

export async function analyzeKeywords(job: string): Promise<string> {
  if (!job || typeof job !== "string") {
    throw new Error("A job description is required");
  }

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
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.2,
    max_completion_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });

  return response.choices[0].message.content ?? "";
}
