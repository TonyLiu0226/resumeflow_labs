"use server";

import { resumeTailorAgent } from "./agent";
import { JobListing } from "../types/job";
import { prisma } from "../lib/prisma";

export async function tailorResumeAction(listing: JobListing, resumeId: string): Promise<{ message: string; newResumeId: string | null }> {
  // Load the resume from DB
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      contact: true,
      education: { include: { courses: true } },
      experience: { include: { bullets: true } },
      projects: { include: { bullets: true } },
      skills: { include: { categories: { include: { items: true } } } },
    },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  const resumeContent = JSON.stringify(resume, null, 2);

    const result = await resumeTailorAgent.invoke(
    {
      messages: [
        {
          role: "user",
          content: `Job Listing:\nTitle: ${listing.jobTitle}\nCompany: ${listing.company}\nDescription: ${listing.description}\n\nMy Resume:\n${resumeContent}`,
        },
      ],
    },
    { recursionLimit: 10 }
  );

  const content = result.messages[result.messages.length - 1].content;
  const messageStr = (typeof content === "string" ? content : JSON.stringify(content)) as string;
  const match = messageStr.match(/NEW_RESUME_ID:\s*([A-Za-z0-9-]+)/);
  
  return {
    message: messageStr,
    newResumeId: match ? match[1] : null,
  };
}
