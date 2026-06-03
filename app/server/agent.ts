import { createAgent } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { analyzeKeywords } from "./keywordsAction";

import fs from "fs/promises";
import path from "path";

import { generatePdfBuffer } from "./resumeAction";

const download_pdf = tool(
    async ({ tailoredResume }) => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        // tailoredResume is already an object due to schema update
        const payload = tailoredResume as any;

        try {
            const { buffer, id } = await generatePdfBuffer(payload);

            // Save PDF to public folder so it can be downloaded via URL
            const publicDir = path.join(process.cwd(), "public", "downloads");
            await fs.mkdir(publicDir, { recursive: true });
            const filePath = path.join(publicDir, `${id}.pdf`);
            await fs.writeFile(filePath, buffer);

            return `${baseUrl}/downloads/${id}.pdf`;
        } catch (error: any) {
            return `CRITICAL FATAL ERROR: Failed to render the LaTeX PDF due to an internal server error (${error.message}). DO NOT RETRY. YOU MUST IMMEDIATELY STOP EXECUTION AND REPLY TO THE USER: "Failed to render PDF."`;
        }
    },
    {
        name: "download_pdf",
        description: "Generate and download a PDF file from the tailored resume content. Returns a download URL.",
        schema: z.object({
            tailoredResume: z.record(z.any()).describe("The full tailored resume object matching the ResumePayload schema (ContactInfo, Education[], Experience[], Project[], SkillCategoryPayload[]). Pass this as a native JSON object, NOT a stringified string."),
        }),
    }
);

const identify_keywords = tool(
    async ({ resumeId, jobDescription }) => {
        let resumeStr = "RESUME NOT FOUND";
        
        if (resumeId) {
            const resumeRecord = await prisma.resume.findUnique({
                where: { id: resumeId },
                include: {
                  contact: true,
                  education: { include: { courses: true } },
                  experience: { include: { bullets: true } },
                  projects: { include: { bullets: true } },
                  skills: { include: { categories: { include: { items: true } } } },
                },
            });
            if (resumeRecord) {
                resumeStr = JSON.stringify(resumeRecord, null, 2);
            }
        }

        const user_prompt = `Job description:\n\n${jobDescription}\n\n Resume:\n\n${resumeStr}`;

        try {
            const result = await analyzeKeywords(user_prompt);
            return result;
        } catch (e) {
            return `CRITICAL FATAL ERROR: Failed to analyze keywords due to a server error. DO NOT RETRY. YOU MUST IMMEDIATELY STOP EXECUTION AND REPLY TO THE USER: "Failed to identify keywords due to an internal server error."`;
        }
    },
    {
        name: "identify_keywords",
        description: "Identifies important keywords from the job description and compare them against the provided resume.",
        schema: z.object({
            resumeId: z.string().describe("The 'id' field from the user's current resume JSON"),
            jobDescription: z.string().describe("The job description to analyze"),
        }),
    }
);

export const resumeTailorAgent = createAgent({
    model: new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        maxTokens: 6000,
    }),
    tools: [identify_keywords, download_pdf],
    systemPrompt: `You are an expert AI career coach and resume writer.
Your task is to automate the process of tailoring resumes for job descriptions.

Follow these steps for every request:
1. The user will provide their current resume and the target job description in their message.
2. First, use the 'identify_keywords' tool to extract the most important keywords from the job description and analyze how well the current resume matches.
3. Next, use the results from the keyword analysis to perfectly tailor the user's resume, highlighting relevant experience and skills. When tailoring resumes:
    a. Ensure that resume bullet points highlight impact and achievement of the work done, rather than just listing responsibilities. Bullet points should follow the format below: \n

    Accomplished X as measured by Y by doing Z

    OR

    Did X using Y to accomplish Z

    OR

    Accomplished X using Y to implement the project feature/goal Z
    b. Use action verbs to start off each resume bullet point, such as "Developed", "Negotiated", "Led", "Built", "Engineered", "Created", "Managed"
    c. Quantify results using reliable and reasonable metrics, such as numbers or percentages
    d. Focus on how the metrics were obtained. What specific actions were taken to result in said metrics?
    e. Keep bullet points concise where possible. Ideally around 20-30 words.
    f. Please, under no circumstances, invent new experiences, projects, or educations.
    g. Ignore filler phrases unless they reflect a meaningful skill or expectation. 

4. Once the resume is perfectly tailored, use the 'download_pdf' tool to generate a PDF file of the tailored resume.
5. Provide the user with a summary of the changes made, the identified keywords from your analysis, and the download link for the PDF.
6. If a tool results in a CRITICAL FATAL ERROR, please stop execution immediately and reply to the user with the error message.

Complete all of these steps in a single workflow.`,
});
