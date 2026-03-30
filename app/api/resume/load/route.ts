import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
   const id: string | null = request.nextUrl.searchParams.get("id");
   if (!id) {
    return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
   }
    try {
        const resume = await prisma.resume.findUnique({
            where: {
                id: id as string,
            },
            include: {
                contact: true,
                education: {
                    include: {
                        courses: true,
                    },
                },
                experience: {
                    include: {
                        bullets: true,
                    },
                },
                projects: {
                    include: {
                        bullets: true,
                    },
                },
                skills: {
                    include: {
                        categories: {
                            include: {
                                items: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return NextResponse.json(resume);
    } catch (error) {
        console.error("Error loading resume:", error);
        return NextResponse.json({ error: "Failed to load resume" }, { status: 500 });
    }
}