import { createAgent } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { analyzeKeywords } from "./keywordsAction";
import crypto from "crypto";

const save_tailored_resume = tool(
    async ({ resumeId, modifiedExperienceBullets, modifiedProjectBullets, companyName, jobTitle }) => {
        try {
            // Fetch original resume from database
            const originalResume = await prisma.resume.findUnique({
                where: { id: resumeId },
                include: {
                    contact: true,
                    education: { include: { courses: true } },
                    experience: { include: { bullets: true } },
                    projects: { include: { bullets: true } },
                    skills: { include: { categories: { include: { items: true } } } },
                },
            });

            if (!originalResume) {
                return `CRITICAL FATAL ERROR: Resume not found in database. DO NOT RETRY.`;
            }

            // Apply modifications
            if (originalResume.experience && modifiedExperienceBullets) {
                for (const exp of originalResume.experience) {
                    for (const bullet of exp.bullets) {
                        const mod = modifiedExperienceBullets.find((m: any) => m.bulletId === bullet.id);
                        if (mod) bullet.content = mod.newContent;
                    }
                }
            }

            if (originalResume.projects && modifiedProjectBullets) {
                for (const proj of originalResume.projects) {
                    for (const bullet of proj.bullets) {
                        const mod = modifiedProjectBullets.find((m: any) => m.bulletId === bullet.id);
                        if (mod) bullet.content = mod.newContent;
                    }
                }
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const newResumeName = `${companyName}_${jobTitle}_${timestamp}`;

            // Create a new clone of the resume
            const newResume = await prisma.resume.create({
                data: {
                    id: crypto.randomUUID(),
                    userId: originalResume.userId,
                    name: newResumeName,
                    contact: originalResume.contact ? {
                        create: {
                            name: originalResume.contact.name,
                            email: originalResume.contact.email,
                            phone: originalResume.contact.phone,
                            github: originalResume.contact.github,
                            linkedin: originalResume.contact.linkedin,
                        }
                    } : undefined,
                    education: {
                        create: originalResume.education.map(e => ({
                            school: e.school,
                            location: e.location,
                            degree: e.degree,
                            dateAchieved: e.dateAchieved,
                            courses: {
                                create: e.courses.map(c => ({ name: c.name }))
                            }
                        }))
                    },
                    experience: {
                        create: originalResume.experience.map(e => ({
                            jobTitle: e.jobTitle,
                            companyName: e.companyName,
                            location: e.location,
                            startDate: e.startDate,
                            endDate: e.endDate,
                            bullets: {
                                create: e.bullets.map(b => ({ content: b.content }))
                            }
                        }))
                    },
                    projects: {
                        create: originalResume.projects.map(p => ({
                            projectTitle: p.projectTitle,
                            projectStart: p.projectStart,
                            projectEnd: p.projectEnd,
                            github: p.github,
                            bullets: {
                                create: p.bullets.map(b => ({ content: b.content }))
                            }
                        }))
                    },
                    skills: originalResume.skills ? {
                        create: {
                            categories: {
                                create: originalResume.skills.categories.map(c => ({
                                    name: c.name,
                                    items: {
                                        create: c.items.map(s => ({ name: s.name }))
                                    }
                                }))
                            }
                        }
                    } : undefined,
                }
            });

            return `SUCCESS: Tailored resume saved successfully. The new resume ID is ${newResume.id}. Please provide this ID to the user exactly as formatted.`;
        } catch (error: any) {
            return `CRITICAL FATAL ERROR: Failed to save the tailored resume due to an internal server error (${error.message}). DO NOT RETRY. YOU MUST IMMEDIATELY STOP EXECUTION AND REPLY TO THE USER.`;
        }
    },
    {
        name: "save_tailored_resume",
        description: "Save the tailored bullet points as a new resume in the database. Returns the new resume ID.",
        schema: z.object({
            resumeId: z.string().describe("The ID of the original resume being tailored."),
            companyName: z.string().describe("The name of the company for the job listing."),
            jobTitle: z.string().describe("The job title for the job listing."),
            modifiedExperienceBullets: z.array(z.object({
                bulletId: z.string().describe("The ID of the bullet point."),
                newContent: z.string().describe("The newly tailored text for this bullet point.")
            })).optional().default([]).describe("An array of all the experience bullet points you rewrote."),
            modifiedProjectBullets: z.array(z.object({
                bulletId: z.string().describe("The ID of the bullet point."),
                newContent: z.string().describe("The newly tailored text for this bullet point.")
            })).optional().default([]).describe("An array of all the project bullet points you rewrote.")
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
        maxTokens: 1500,
    }),
    tools: [identify_keywords, save_tailored_resume],
    systemPrompt: `You are an expert AI career coach and resume writer.
Your task is to automate the process of tailoring resumes for job descriptions.

Follow these steps for every request:
1. The user will provide their current resume and the target job description in their message.
2. First, use the 'identify_keywords' tool to extract the most important keywords from the job description and analyze how well the current resume matches.
3. Next, use the results from the keyword analysis to perfectly tailor the user's resume, highlighting relevant experience and skills. Please modify the JSON payload by outputting two arrays, one each of modifiedExperienceBullets and modifiedProjectBullets consisting of the list of experience bullets modified, and list of project bullets modified, respectively. You MUST make sure both these arrays exist and are outputted, otherwise you have failed this step. When tailoring resumes:
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
    
    CRITICAL INSTRUCTION: You MUST actively modify the JSON payload before passing it to save_tailored_resume. You MUST rewrite the 'content' strings inside the 'bullets' arrays for 'experience' and 'projects' to incorporate the keywords. DO NOT just pass the original unmodified resume JSON back to the tool. If you do not rewrite the bullet points to be better, you have failed your task.

4. Once the resume is perfectly tailored, use the 'save_tailored_resume' tool to save the tailored resume to the database. You MUST pass the companyName and jobTitle arguments to this tool.
5. Provide the user with a summary of the changes made, the identified keywords from your analysis, and the NEW resume ID returned by the tool (format it exactly like this: \`NEW_RESUME_ID: <id>\`).
6. If a tool results in a CRITICAL FATAL ERROR, please stop execution immediately and reply to the user with the error message.

Complete all of these steps in a single workflow.`,
});
