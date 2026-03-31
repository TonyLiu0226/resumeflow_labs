import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  const userId: string | null = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        dateCreated: true,
        dateModified: true,
      },
      orderBy: { dateModified: "desc" },
    });
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error listing resumes:", error);
    return NextResponse.json({ error: "Failed to list resumes" }, { status: 500 });
  }
}
