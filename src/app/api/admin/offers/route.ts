import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: List all offers
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const offers = await db.offer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ offers });
  } catch (err: any) {
    console.error("Admin offers error:", err);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

// POST: Create a new promotional offer
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      title,
      subtitle,
      badgeText = "LIMITED TIME",
      bannerColor = "#2563eb",
      couponCode,
      targetAudience = "ALL",
      ctaText = "Claim Offer",
      ctaLink = "/dashboard?tab=billing",
      validUntil,
      isActive = true,
    } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Offer title is required" }, { status: 400 });
    }

    const offer = await db.offer.create({
      data: {
        title,
        subtitle: subtitle || "",
        badgeText: badgeText || "LIMITED TIME",
        bannerColor: bannerColor || "#2563eb",
        couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
        targetAudience,
        ctaText: ctaText || "Claim Offer",
        ctaLink: ctaLink || "/dashboard?tab=billing",
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, offer });
  } catch (err: any) {
    console.error("Create offer error:", err);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

// PUT: Update an existing offer
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      id,
      title,
      subtitle,
      badgeText,
      bannerColor,
      couponCode,
      targetAudience,
      ctaText,
      ctaLink,
      validUntil,
      isActive,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    const updated = await db.offer.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(badgeText !== undefined && { badgeText }),
        ...(bannerColor !== undefined && { bannerColor }),
        ...(couponCode !== undefined && { couponCode: couponCode ? couponCode.toUpperCase().trim() : null }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(ctaText !== undefined && { ctaText }),
        ...(ctaLink !== undefined && { ctaLink }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, offer: updated });
  } catch (err: any) {
    console.error("Update offer error:", err);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

// DELETE: Delete an offer
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    await db.offer.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete offer error:", err);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
