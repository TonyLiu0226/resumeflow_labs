import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { dateApplied: "desc" },
      select: {
        id: true,
        company: true,
        jobTitle: true,
        description: true,
        resumeId: true,
        resumeName: true,
        status: true,
        dateApplied: true,
      },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error listing jobs:", error);
    return NextResponse.json({ error: "Failed to list jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, company, jobTitle, description, resumeId, resumeName, dateApplied } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    if (!company || !jobTitle) {
      return NextResponse.json(
        { error: "Company and job title are required" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        userId,
        company,
        jobTitle,
        description: description || "",
        resumeId: resumeId || null,
        resumeName: resumeName || "",
        status: "Applied",
        dateApplied: dateApplied ? new Date(dateApplied) : new Date(),
      },
      select: {
        id: true,
        company: true,
        jobTitle: true,
        description: true,
        resumeId: true,
        resumeName: true,
        status: true,
        dateApplied: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
