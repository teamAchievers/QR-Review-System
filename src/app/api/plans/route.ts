import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET: Fetch active public subscription plans
export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { monthlyPrice: "asc" }],
    });

    return NextResponse.json({ plans }, { headers: corsHeaders });
  } catch (err: any) {
    console.error("Fetch plans error:", err);
    return NextResponse.json({ plans: [] }, { status: 500, headers: corsHeaders });
  }
}
