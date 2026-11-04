import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [totalBusinesses, totalScans, totalLowFeedbacks, totalHighRedirects, businesses] = await Promise.all([
    db.business.count(),
    db.scanLog.count({ where: { action: "QR_SCANNED" } }),
    db.feedback.count(),
    db.scanLog.count({ where: { action: { in: ["HIGH_RATING_SUBMITTED", "COPIED_TO_GOOGLE"] } } }),
    db.business.findMany({
      include: {
        users: { select: { id: true, email: true, name: true } },
        _count: {
          select: {
            feedbacks: true,
            scanLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Subscription analytics
  const activeSubscriptions = businesses.filter((b) => b.subscriptionStatus === "ACTIVE").length;
  const dueSubscriptions = businesses.filter((b) => b.subscriptionStatus === "DUE").length;
  const suspendedSubscriptions = businesses.filter((b) => b.subscriptionStatus === "SUSPENDED").length;
  const trialSubscriptions = businesses.filter((b) => b.subscriptionStatus === "TRIAL").length;
  const totalMRR = businesses
    .filter((b) => b.subscriptionStatus === "ACTIVE" || b.subscriptionStatus === "DUE")
    .reduce((sum, b) => sum + (b.planPrice || 0), 0);

  return NextResponse.json({
    metrics: {
      totalBusinesses,
      totalScans,
      totalLowFeedbacks,
      totalHighRedirects,
      activeSubscriptions,
      dueSubscriptions,
      suspendedSubscriptions,
      trialSubscriptions,
      totalMRR,
    },
    businesses,
  });
}
