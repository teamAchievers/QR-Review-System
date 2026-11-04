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

  const business = await db.business.findUnique({
    where: { id: businessId },
  });

  return NextResponse.json({ business });
}

export async function PUT(req: NextRequest) {
  try {
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
        ...(googleReviewUrl !== undefined && { googleReviewUrl: googleReviewUrl.trim() }),
        ...(tripadvisorReviewUrl !== undefined && { tripadvisorReviewUrl: tripadvisorReviewUrl?.trim() || null }),
        ...(reviewPlatform !== undefined && { reviewPlatform }),
        ...(googlePlaceId !== undefined && { googlePlaceId: googlePlaceId?.trim() || null }),
        ...(keywords !== undefined && { keywords: keywords.trim() }),
        ...(targetTone !== undefined && { targetTone: targetTone.trim() }),
        ...(minGoogleStar !== undefined && { minGoogleStar: Number(minGoogleStar) }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(poweredByText !== undefined && { poweredByText: poweredByText?.trim() || "Unbox Studio" }),
        ...(poweredByUrl !== undefined && { poweredByUrl: poweredByUrl?.trim() || "https://unboxstudio.com" }),
      },
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (err: any) {
    console.error("Update settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
