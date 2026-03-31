import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import type { ResumeEducation, ResumeExperience, ResumeProject, ResumeSkillCategory } from "../../../types/resume";

export async function POST(request: NextRequest) {
   const { userId, resumeId, name, contact, education, experience, projects, skillCategories } = await request.json();
   console.log(resumeId);
    try {
        const newResume = await prisma.resume.upsert({
            where: {
                id: resumeId as string,
            },
            update: {
                userId: userId as string,
                ...(name !== undefined && { name: name as string }),
                contact: {
                    delete: true,
                    create: {
                      email: contact.email,
                      phone: contact.phone,
                      github: contact.github,
                      linkedin: contact.linkedin,
                    },
                  },
                education: {
                  deleteMany: {},
                  create: education.map((e: ResumeEducation) => ({
                    school: e.school,
                    location: e.location,
                    degree: e.degree,
                    dateAchieved: e.dateAchieved,
                    courses: {
                      create: e.courses.map((c: string) => ({
                        name: c,
                      })),
                    },
                  })),
                },
        
                experience: {
                  deleteMany: {},
                  create: experience.map((e: ResumeExperience) => ({
                    jobTitle: e.jobTitle,
                    companyName: e.companyName,
                    location: e.location,
                    startDate: e.startDate,
                    endDate: e.endDate,
                    bullets: {
                      create: e.bulletPoints.map((b: string) => ({
                        content: b,
                      })),
                    },
                  })),
                },
        
                projects: {
                  deleteMany: {},
                  create: projects.map((e: ResumeProject) => ({
                    projectTitle: e.title,
                    projectStart: e.startDate,
                    projectEnd: e.endDate,
                    github: e.githubLink,
                    bullets: {
                      create: e.bulletPoints.map((b: string) => ({
                        content: b,
                      })),
                    },
                  })),
                },
        
                skills: {
                  delete: true,
                  create: {
                    categories: {
                      create: skillCategories.map((e: ResumeSkillCategory) => ({
                        name: e.name,
                        items: {
                          create: e.skills.map((s: string) => ({
                            name: s,
                          })),
                        },
                      })),
                    },
                  },
                }
            },
            create: {
                userId: userId as string,
                name: (name as string) || "Untitled Resume",
                dateCreated: new Date(),
                dateModified: new Date(),
                contact: {
                    create: {
                        email: contact.email,
                        phone: contact.phone,
                        github: contact.github,
                        linkedin: contact.linkedin,
                    },
                },
                education: {
                    create: education.map((e: ResumeEducation) => ({
                        school: e.school,
                        location: e.location,
                        degree: e.degree,
                        dateAchieved: e.dateAchieved,
                        courses: {
                            create: e.courses.map((c: string) => ({
                                name: c,
                            })),
                        },
                    })),
                },
                experience: {
                    create: experience.map((e: ResumeExperience) => ({
                        jobTitle: e.jobTitle,
                        companyName: e.companyName,
                        location: e.location,
                        startDate: e.startDate,
                        endDate: e.endDate,
                        bullets: {
                            create: e.bulletPoints.map((b: string) => ({
                                content: b,
                            })),
                        },
                    })),
                },
                projects: {
                    create: projects.map((e: ResumeProject) => ({
                        projectTitle: e.title,
                        projectStart: e.startDate,
                        projectEnd: e.endDate,
                        github: e.githubLink,
                        bullets: {
                            create: e.bulletPoints.map((b: string) => ({
                                content: b,
                            })),
                        },
                    })),
                },
                skills: {
                    create: {
                        categories: {
                            create: skillCategories.map((e: ResumeSkillCategory) => ({
                                name: e.name,
                                items: {
                                    create: e.skills.map((s: string) => ({
                                        name: s,
                                    })),
                                },
                            })),
                        },
                    },
                },
            },
        });
        return NextResponse.json({ id: newResume.id, message: "Resume saved successfully" });
    } catch (error) {
        console.error("Error saving resume:", error);
        return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
    }
}
