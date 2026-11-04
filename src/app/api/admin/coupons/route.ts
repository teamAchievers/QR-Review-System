import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: List all coupons
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (err: any) {
    console.error("Admin coupons error:", err);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST: Create a new coupon
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      code,
      description,
      discountType = "PERCENTAGE", // "PERCENTAGE" or "FLAT"
      discountValue,
      minOrderValue = 0,
      maxUses,
      validUntil,
      isActive = true,
    } = await req.json();

    if (!code || discountValue === undefined) {
      return NextResponse.json({ error: "Coupon code and discount value are required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim().replace(/\s+/g, "");

    const existing = await db.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        description: description || "",
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxUses: maxUses ? Number(maxUses) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    console.error("Create coupon error:", err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

// PUT: Update an existing coupon
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      id,
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxUses,
      validUntil,
      isActive,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const updated = await db.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase().trim().replace(/\s+/g, "") }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: Number(minOrderValue) }),
        ...(maxUses !== undefined && { maxUses: maxUses ? Number(maxUses) : null }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    console.error("Update coupon error:", err);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE: Delete a coupon
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete coupon error:", err);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
