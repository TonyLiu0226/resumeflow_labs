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

const get_resume = tool(
    async ({resumeId}) => {
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

        if (!resumeRecord) {
            return null;
        }

        const { id, userId, ...resumeData } = resumeRecord;

        return {
            name: resumeData.name,
            contact: {
                email: resumeData.contact?.email || "",
                phone: resumeData.contact?.phone || "",
                linkedin: resumeData.contact?.linkedin || "",
            },
            education: resumeData.education.map((edu) => ({
                id: edu.id,
                degree: edu.degree,
                school: edu.school,
                location: edu.location,
                date: edu.dateAchieved,
                courses: edu.courses.map((course) => ({ name: course.name }))
            })),
            experience: resumeData.experience.map((exp) => ({
                id: exp.id,
                company: exp.companyName,
                role: exp.jobTitle,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                bullets: exp.bullets.map((bullet) => ({ text: bullet.content }))
            })),
            projects: resumeData.projects.map((proj) => ({
                id: proj.id,
                name: proj.projectTitle,
                bullets: proj.bullets.map((bullet) => ({ text: bullet.content }))
            })),
            skills: resumeData?.skills?.categories?.map((category) => ({
                category: category.name,
                items: category.items.map((item) => ({ name: item.name }))
            })) || []
        }
    }, {
        name: "get_resume",
        description: "Get the resume by ID.",
        schema: z.object({
            resumeId: z.string().describe("The ID of the resume to get."),
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

export const coverLetterAgent = createAgent({
    model: new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        maxTokens: 6000,
    }),
    tools: [identify_keywords, get_resume],
    systemPrompt: `You are an expert AI career coach tailored towards building great cover letters for candidates applying to roles they are passionate about.
Your task is to generate tailored, engaging, and truthful cover letters based on:
1. The user's target job description.
2. The user's resume retrieved from the database.

Follow these steps for every request:
1. The user will provide their resume and target job description in the message
2. Call the identify_keywords tool to identify important keywords from the job description.
3. Call the get_resume tool to get the user's resume from the database and extract important information such as education, experience, and projects.
4. Extract only factual information from the resume, including:
   - Candidate name
   - Phone number
   - Email
   - Education
   - Work experience
   - Projects
   - Technical skills
   - Achievements
5. Generate a tailored cover letter that connects the candidate's real background to the job description.

IMPORTANT COVER LETTER GUIDELINES:
- Do not invent, exaggerate, or assume experience, education, projects, tools, companies, metrics, or achievements.
- Do not include anything that is not supported by the retrieved resume.
- Do not copy resume bullets or sentences directly.
- Do not simply restate the resume in paragraph form.
- Do not use generic filler language.
- Do not use the phrase: "I am writing to express my interest in the [Job Title] position at [Company Name]".
- Do not mention internal tool usage, keyword extraction, or the resume database.
- If required information is missing from the resume, omit it gracefully rather than inventing it.
- If the company name or job title is unclear from the job description use a neutral phrasing.

Cover letter structure:
1. Header:
   - Candidate name
   - Phone number
   - Email

2. To section:
   - Company Name
   - Company Address, if known
   - Dear Hiring Manager,

3. Body:
   - One engaging introduction paragraph, highlighting why the candidate is a great fit for the job without going into detail.
   - One to two body paragraphs elaborating on the introduction, connecting the most relevant parts of the candidate's real experience, projects, and skills to the job description.
   - One conclusion paragraph with a confident but professional closing.
   - Please view the sample.txt file for an example of a good cover letter. However, DO NOT COPY the example.

4. Closing:
    - One short paragraph re-iterating that the candidate would be a great fit for the role, and a call to action for the hiring manager to contact them to discuss the position further.

5. Sign-off:
    - \nThank You, \n\n
    [Candidate Full Name]

Writing guidelines:
- Make the opening specific and engaging.
- Highlight the majority of important keywords from the job description naturally.
- Prioritize the most relevant resume experiences over less relevant ones.
- Emphasize impact, technical fit, product thinking, collaboration, and learning ability where supported by the resume.
- Use confident, concise, professional language.
- Vary sentence structure so the letter does not sound templated.
- Keep the letter between 250 and 400 words unless the user requests otherwise.
- Tailor the tone to the company and role:
  - For startups: energetic, ownership-focused, product-minded.
  - For large tech companies: scalable systems, collaboration, technical depth.
  - For research or AI roles: experimentation, model/tooling experience, analytical thinking.
  - For frontend roles: user experience, component quality, performance, accessibility.
  - For backend roles: reliability, APIs, databases, distributed systems, infrastructure.
  - For full-stack roles: end-to-end ownership and cross-functional delivery.

Output requirements:
- Output only the final cover letter.
- Do not include explanations, notes, keyword lists, or analysis.

Complete all of these steps in a single workflow.`,
});
