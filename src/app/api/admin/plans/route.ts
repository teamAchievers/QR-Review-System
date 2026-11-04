import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: List all subscription plans
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const plans = await db.plan.findMany({
      orderBy: [{ sortOrder: "asc" }, { monthlyPrice: "asc" }],
    });

    return NextResponse.json({ plans });
  } catch (err: any) {
    console.error("Admin plans error:", err);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

// POST: Create a new plan
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      code,
      name,
      description,
      monthlyPrice,
      annualPrice,
      currency = "INR",
      features,
      isPopular = false,
      isActive = true,
      sortOrder = 0,
    } = await req.json();

    if (!code || !name) {
      return NextResponse.json({ error: "Plan code and name are required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    const existing = await db.plan.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "Plan code already exists" }, { status: 400 });
    }

    const plan = await db.plan.create({
      data: {
        code: cleanCode,
        name,
        description: description || "",
        monthlyPrice: Number(monthlyPrice) || 0,
        annualPrice: Number(annualPrice) || 0,
        currency,
        features: features || "",
        isPopular: Boolean(isPopular),
        isActive: Boolean(isActive),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (err: any) {
    console.error("Create plan error:", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

// PUT: Update an existing plan
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      id,
      code,
      name,
      description,
      monthlyPrice,
      annualPrice,
      currency,
      features,
      isPopular,
      isActive,
      sortOrder,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const updated = await db.plan.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(monthlyPrice !== undefined && { monthlyPrice: Number(monthlyPrice) }),
        ...(annualPrice !== undefined && { annualPrice: Number(annualPrice) }),
        ...(currency && { currency }),
        ...(features !== undefined && { features }),
        ...(isPopular !== undefined && { isPopular: Boolean(isPopular) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (err: any) {
    console.error("Update plan error:", err);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

// DELETE: Delete or deactivate a plan
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    await db.plan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete plan error:", err);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
