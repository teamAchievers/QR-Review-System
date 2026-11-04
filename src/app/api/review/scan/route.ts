import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const userAgent = req.headers.get("user-agent") || undefined;

    await db.scanLog.create({
      data: {
        businessId: business.id,
        action: "QR_SCANNED",
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Scan log error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
