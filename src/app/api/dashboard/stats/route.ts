import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateSubscription } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedBizId = searchParams.get("businessId");

    // Allow BUSINESS_ADMIN, AGENT, FIELD_AGENT, SUPER_ADMIN
    const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";

    let businessId = session.businessId;

    if (isElevated && requestedBizId) {
      const targetBiz = await db.business.findUnique({ where: { id: requestedBizId } });
      if (targetBiz) {
        businessId = targetBiz.id;
      }
    }

    // Fallback if user is unlinked/floating agent
    if (!businessId) {
      const firstBusiness = await db.business.findFirst({
        orderBy: { createdAt: "desc" },
      });
      businessId = firstBusiness?.id || null;
    }

    if (!businessId) {
      return NextResponse.json({
        business: null,
        isEmpty: true,
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
        },
        allBusinesses: [],
        metrics: { totalScans: 0, lowRatings: 0, highRatings: 0, copiedToGoogle: 0, totalFeedback: 0 },
        feedbacks: [],
      });
    }

    const [business, globalTripadvisor, totalScans, lowRatings, highRatings, copiedToGoogle, feedbacks, allBusinesses] = await Promise.all([
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
      isElevated
        ? db.business.findMany({
            select: { id: true, name: true, slug: true, city: true, category: true },
            orderBy: { name: "asc" },
          })
        : Promise.resolve([]),
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
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      },
      allBusinesses,
    });
  } catch (err: any) {
    console.error("GET /api/dashboard/stats error:", err);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
