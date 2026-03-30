import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function DELETE(request: NextRequest) {
   const id: string | null = request.nextUrl.searchParams.get("id");
   if (!id) {
    return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
   }
    try {
        await prisma.resume.delete({
            where: {
                id: id as string,
            }
        })
        return NextResponse.json({ message: "Resume deleted successfully" });
    } catch (error) {
        console.error("Error deleting resume:", error);
        return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
    }
}