import { GoogleGenAI } from "@google/genai";

const globalForGemini = globalThis as unknown as {
  geminiClient?: GoogleGenAI;
};

export function getGeminiClient(): GoogleGenAI {
  if (globalForGemini.geminiClient) {
    return globalForGemini.geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your environment before using Gemini APIs."
    );
  }

  const client = new GoogleGenAI({ apiKey });
  globalForGemini.geminiClient = client;
  return client;
}
