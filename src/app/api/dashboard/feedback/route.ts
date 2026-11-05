import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestedBizId = searchParams.get("businessId");
  const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";

  let businessId = session.businessId;
  if (isElevated && requestedBizId) {
    businessId = requestedBizId;
  } else if (!businessId) {
    const first = await db.business.findFirst({ orderBy: { createdAt: "desc" } });
    businessId = first?.id || null;
  }

  if (!businessId) {
    return NextResponse.json({ feedbacks: [] });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("PATCH /api/dashboard/feedback error:", err);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
