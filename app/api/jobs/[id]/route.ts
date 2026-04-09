import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["Applied", "OA", "Interviewing", "Offered", "Rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const job = await prisma.job.update({
      where: { id },
      data: { status },
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

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
