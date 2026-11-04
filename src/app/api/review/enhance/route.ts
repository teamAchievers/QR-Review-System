import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enhanceReviewWithKeywords } from "@/lib/ai-review";

export async function POST(req: NextRequest) {
  try {
    const { slug, rating, comment } = await req.json();

    if (!slug || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        city: true,
        category: true,
        keywords: true,
        targetTone: true,
        googleReviewUrl: true,
        googlePlaceId: true,
        tripadvisorReviewUrl: true,
        reviewPlatform: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Enhance with keywords
    const enhancedOptions = await enhanceReviewWithKeywords({
      userComment: comment,
      rating: Number(rating),
      businessName: business.name,
      city: business.city,
      category: business.category,
      keywords: business.keywords,
      tone: business.targetTone,
    });

    // Record high rating action
    const userAgent = req.headers.get("user-agent") || undefined;
    await db.scanLog.create({
      data: {
        businessId: business.id,
        rating: Number(rating),
        action: "HIGH_RATING_SUBMITTED",
        userAgent,
      },
    });

    // Ensure valid Google review URL fallback
    let googleUrl = business.googleReviewUrl;
    if (!googleUrl && business.googlePlaceId) {
      googleUrl = `https://search.google.com/local/writereview?placeid=${business.googlePlaceId}`;
    }
    if (!googleUrl) {
      googleUrl = `https://www.google.com/search?q=${encodeURIComponent(business.name + (business.city ? " " + business.city : ""))}`;
    }

    return NextResponse.json({
      success: true,
      businessName: business.name,
      googleReviewUrl: googleUrl,
      tripadvisorReviewUrl: business.tripadvisorReviewUrl || "",
      reviewPlatform: business.reviewPlatform || "GOOGLE",
      options: enhancedOptions,
      originalComment: comment,
      keywordsUsed: business.keywords,
    });
  } catch (err: any) {
    console.error("Enhance review error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
