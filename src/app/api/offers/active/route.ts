import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch currently active promotional offers for banners in client dashboard / checkout
export async function GET() {
  try {
    const now = new Date();
    const offers = await db.offer.findMany({
      where: {
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ offers });
  } catch (err: any) {
    console.error("Fetch active offers error:", err);
    return NextResponse.json({ offers: [] }, { status: 500 });
  }
}
