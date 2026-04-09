import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function DELETE(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const result = await prisma.job.deleteMany({
      where: { userId, status: "Rejected" },
    });
    return NextResponse.json({
      message: `Deleted ${result.count} rejected job(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting rejected jobs:", error);
    return NextResponse.json(
      { error: "Failed to delete rejected jobs" },
      { status: 500 }
    );
  }
}
