import { Groq } from 'groq-sdk';

const globalForGroq = globalThis as unknown as {
  groqClient?: Groq;
};

export function getGroqClient(): Groq {
  if (globalForGroq.groqClient) {
    return globalForGroq.groqClient;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to your environment before using Groq APIs.");
  }

  const client = new Groq({ apiKey });
  globalForGroq.groqClient = client;
  return client;
}
