import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { generatePdfBuffer } from "../../../server/resumeAction";
import type { ResumePayload } from "../../../types/resume";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing resume ID" }, { status: 400 });
  }

  try {
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        contact: true,
        education: { include: { courses: true } },
        experience: { include: { bullets: true } },
        projects: { include: { bullets: true } },
        skills: { include: { categories: { include: { items: true } } } },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const payload: ResumePayload = {
      contact: resume.contact || { name: "", email: "", phone: "", github: "", linkedin: "" },
      education: resume.education.map(e => ({
        id: e.id,
        schoolName: e.school,
        location: e.location,
        degree: e.degree,
        dateAchieved: e.dateAchieved,
        courses: e.courses.map(c => c.name)
      })),
      experience: resume.experience.map(e => ({
        id: e.id,
        jobTitle: e.jobTitle,
        companyName: e.companyName,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        bulletPoints: e.bullets.map(b => b.content)
      })),
      projects: resume.projects.map(p => ({
        id: p.id,
        title: p.projectTitle,
        startDate: p.projectStart,
        endDate: p.projectEnd,
        githubLink: p.github,
        bulletPoints: p.bullets.map(b => b.content)
      })),
      skillCategories: resume.skills ? resume.skills.categories.map(c => ({
        name: c.name,
        skills: c.items.map(s => s.name)
      })) : []
    };

    const { buffer } = await generatePdfBuffer(payload);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resume.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
