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
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const business = await db.business.findUnique({
    where: { id: businessId },
  });

  return NextResponse.json({ business });
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAgent = session.role === "AGENT" || session.role === "FIELD_AGENT";
    const isElevated = session.role === "SUPER_ADMIN" || isAgent;

    const { searchParams } = new URL(req.url);
    const requestedBizId = searchParams.get("businessId");

    let businessId = session.businessId;
    if (isElevated && requestedBizId) {
      businessId = requestedBizId;
    } else if (!businessId) {
      const first = await db.business.findFirst({ orderBy: { createdAt: "desc" } });
      businessId = first?.id || null;
    }

    if (!businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const body = await req.json();

    // If agent, allow updating Google Review Link and related review coordinates only
    if (isAgent) {
      const { googleReviewUrl, googlePlaceId, tripadvisorReviewUrl, reviewPlatform } = body;

      if (googleReviewUrl === undefined && googlePlaceId === undefined && tripadvisorReviewUrl === undefined) {
        return NextResponse.json(
          { error: "Agents only have permission to edit the Google Review Link / Review configuration." },
          { status: 403 }
        );
      }

      const updated = await db.business.update({
        where: { id: businessId },
        data: {
          ...(googleReviewUrl !== undefined && { googleReviewUrl: googleReviewUrl?.trim() || "" }),
          ...(googlePlaceId !== undefined && { googlePlaceId: googlePlaceId?.trim() || null }),
          ...(tripadvisorReviewUrl !== undefined && { tripadvisorReviewUrl: tripadvisorReviewUrl?.trim() || null }),
          ...(reviewPlatform && { reviewPlatform }),
        },
      });

      return NextResponse.json({ success: true, business: updated });
    }

    const {
      name,
      tagline,
      city,
      category,
      phone,
      email,
      logoUrl,
      googleReviewUrl,
      tripadvisorReviewUrl,
      reviewPlatform,
      googlePlaceId,
      keywords,
      targetTone,
      minGoogleStar,
      primaryColor,
      poweredByText,
      poweredByUrl,
    } = await req.json();

    const updated = await db.business.update({
      where: { id: businessId },
      data: {
        ...(name && { name: name.trim() }),
        ...(tagline !== undefined && { tagline: tagline?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(category !== undefined && { category: category?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
        ...(googleReviewUrl && { googleReviewUrl: googleReviewUrl.trim() }),
        ...(tripadvisorReviewUrl !== undefined && { tripadvisorReviewUrl: tripadvisorReviewUrl?.trim() || null }),
        ...(reviewPlatform && { reviewPlatform }),
        ...(googlePlaceId !== undefined && { googlePlaceId: googlePlaceId?.trim() || null }),
        ...(keywords !== undefined && { keywords }),
        ...(targetTone !== undefined && { targetTone }),
        ...(minGoogleStar !== undefined && { minGoogleStar: Number(minGoogleStar) }),
        ...(primaryColor && { primaryColor }),
        ...(poweredByText !== undefined && { poweredByText: poweredByText?.trim() || null }),
        ...(poweredByUrl !== undefined && { poweredByUrl: poweredByUrl?.trim() || null }),
      },
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (err: any) {
    console.error("PUT /api/dashboard/settings error:", err);
    return NextResponse.json({ error: "Failed to update business profile" }, { status: 500 });
  }
}
