import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { slug, rating, comment, customerName, customerContact } = await req.json();

    if (!slug || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Save private feedback
    const feedback = await db.feedback.create({
      data: {
        businessId: business.id,
        rating: Number(rating),
        comment: comment.trim(),
        customerName: customerName ? customerName.trim() : null,
        customerContact: customerContact ? customerContact.trim() : null,
        status: "NEW",
      },
    });

    // Record in scan log
    const userAgent = req.headers.get("user-agent") || undefined;
    await db.scanLog.create({
      data: {
        businessId: business.id,
        rating: Number(rating),
        action: "LOW_RATING_SUBMITTED",
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your valuable feedback. Our management team has been notified.",
      feedbackId: feedback.id,
    });
  } catch (err: any) {
    console.error("Feedback submission error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
