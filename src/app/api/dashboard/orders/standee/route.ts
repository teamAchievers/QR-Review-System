import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// POST: Create a new physical standee order
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let businessId = session.businessId;
    if (!businessId && session.role === "SUPER_ADMIN") {
      const first = await db.business.findFirst();
      businessId = first?.id || null;
    }

    if (!businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const {
      contactName,
      contactPhone,
      shippingAddress,
      city,
      postalCode,
      standeeType = "ACRYLIC_A6",
      quantity = 1,
      totalPrice = 499,
      courierNotes,
      couponCode,
    } = await req.json();

    if (!contactName || !contactPhone || !shippingAddress) {
      return NextResponse.json({ error: "Missing required shipping information" }, { status: 400 });
    }

    let finalPrice = Number(totalPrice) || 499;
    let appliedDiscount = 0;
    let validCode: string | null = null;

    if (couponCode && typeof couponCode === "string") {
      const clean = couponCode.toUpperCase().trim();
      const c = await db.coupon.findUnique({ where: { code: clean } });
      if (c && c.isActive) {
        const expired = c.validUntil && new Date(c.validUntil) < new Date();
        const maxed = c.maxUses && c.usedCount >= c.maxUses;
        if (!expired && !maxed) {
          validCode = c.code;
          if (c.discountType === "PERCENTAGE") {
            appliedDiscount = (finalPrice * c.discountValue) / 100;
          } else {
            appliedDiscount = c.discountValue;
          }
          appliedDiscount = Math.min(finalPrice, appliedDiscount);
          finalPrice = Math.max(0, finalPrice - appliedDiscount);

          await db.coupon.update({
            where: { code: c.code },
            data: { usedCount: { increment: 1 } },
          }).catch(() => {});
        }
      }
    }

    const orderNotes = [
      courierNotes,
      validCode ? `[Coupon: ${validCode}, Saved ₹${appliedDiscount}]` : null,
    ].filter(Boolean).join(" ");

    const order = await db.standeeOrder.create({
      data: {
        businessId,
        contactName,
        contactPhone,
        shippingAddress,
        city: city || "",
        postalCode: postalCode || "",
        standeeType,
        quantity: Number(quantity) || 1,
        totalPrice: finalPrice,
        status: "PENDING",
        courierNotes: orderNotes,
      },
    });

    return NextResponse.json({ success: true, order, discountAmount: appliedDiscount, finalPrice });
  } catch (err: any) {
    console.error("Standee order error:", err);
    return NextResponse.json({ error: "Failed to place standee order" }, { status: 500 });
  }
}

// GET: Retrieve past orders for this business
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let businessId = session.businessId;
    if (!businessId && session.role === "SUPER_ADMIN") {
      const first = await db.business.findFirst();
      businessId = first?.id || null;
    }

    if (!businessId) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const orders = await db.standeeOrder.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Get standee orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
