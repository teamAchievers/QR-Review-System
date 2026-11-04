import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { slug, platform } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (business) {
      const userAgent = req.headers.get("user-agent") || undefined;
      await db.scanLog.create({
        data: {
          businessId: business.id,
          rating: 5,
          action: platform === "tripadvisor" ? "COPIED_TO_TRIPADVISOR" : "COPIED_TO_GOOGLE",
          userAgent,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Track Google click error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
