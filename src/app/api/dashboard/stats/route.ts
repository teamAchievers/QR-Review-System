import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateSubscription } from "@/lib/subscription";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "BUSINESS_ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // If super admin has a businessId or views default, find business
  let businessId = session.businessId;
  if (!businessId && session.role === "SUPER_ADMIN") {
    const firstBusiness = await db.business.findFirst();
    businessId = firstBusiness?.id || null;
  }

  if (!businessId) {
    return NextResponse.json({ error: "No business associated with this account" }, { status: 404 });
  }

  const [business, globalTripadvisor, totalScans, lowRatings, highRatings, copiedToGoogle, feedbacks] = await Promise.all([
    db.business.findUnique({
      where: { id: businessId },
    }),
    db.systemSetting.findUnique({ where: { key: "enableTripadvisor" } }),
    db.scanLog.count({ where: { businessId, action: "QR_SCANNED" } }),
    db.scanLog.count({ where: { businessId, action: "LOW_RATING_SUBMITTED" } }),
    db.scanLog.count({ where: { businessId, action: "HIGH_RATING_SUBMITTED" } }),
    db.scanLog.count({ where: { businessId, action: "COPIED_TO_GOOGLE" } }),
    db.feedback.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const isTripadvisorAllowed = (globalTripadvisor?.value !== "false") && (business.tripadvisorEnabled ?? true);
  const subscriptionState = evaluateSubscription(business);

  return NextResponse.json({
    business,
    isTripadvisorAllowed,
    subscriptionState,
    metrics: {
      totalScans,
      lowRatings,
      highRatings,
      copiedToGoogle,
      totalFeedback: feedbacks.length,
    },
    feedbacks,
  });
}
