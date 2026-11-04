import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, amount = 0 } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = await db.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    // Check expiration
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json({ error: "This coupon code has expired" }, { status: 400 });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its maximum usage limit" }, { status: 400 });
    }

    // Check minimum order value
    if (coupon.minOrderValue && Number(amount) < coupon.minOrderValue) {
      return NextResponse.json({
        error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (Number(amount) * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Cap discount at total amount
    discountAmount = Math.min(Number(amount), discountAmount);
    const finalAmount = Math.max(0, Number(amount) - discountAmount);

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      originalAmount: Number(amount),
      discountAmount,
      finalAmount,
    });
  } catch (err: any) {
    console.error("Validate coupon error:", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
