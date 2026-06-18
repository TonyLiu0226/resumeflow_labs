"use server";

import { coverLetterAgent } from "./agent";
import { JobListing } from "../types/job";

export async function generateCoverLetterAction(listing: JobListing, resumeId: string): Promise<{ message: string }> {
  const result = await coverLetterAgent.invoke(
    {
      messages: [
        {
          role: "user",
          content: `Job Listing:\nTitle: ${listing.jobTitle}\nCompany: ${listing.company}\nDescription: ${listing.description}\n\nMy Resume ID: ${resumeId}`,
        },
      ],
    },
    { recursionLimit: 10 }
  );

  const content = result.messages[result.messages.length - 1].content;
  const messageStr = (typeof content === "string" ? content : JSON.stringify(content)) as string;
  
  return {
    message: messageStr,
  };
}
