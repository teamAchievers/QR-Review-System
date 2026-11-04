import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let businessId = session.businessId;
  if (!businessId && session.role === "SUPER_ADMIN") {
    const first = await db.business.findFirst();
    businessId = first?.id || null;
  }

  if (!businessId) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const feedbacks = await db.feedback.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ feedbacks });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { feedbackId, status, internalNotes } = await req.json();

    if (!feedbackId) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 });
    }

    const updated = await db.feedback.update({
      where: { id: feedbackId },
      data: {
        ...(status && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
    });

    return NextResponse.json({ success: true, feedback: updated });
  } catch (err: any) {
    console.error("Update feedback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
