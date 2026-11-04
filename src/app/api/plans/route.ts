import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch active public subscription plans
export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { monthlyPrice: "asc" }],
    });

    return NextResponse.json({ plans });
  } catch (err: any) {
    console.error("Fetch plans error:", err);
    return NextResponse.json({ plans: [] }, { status: 500 });
  }
}
