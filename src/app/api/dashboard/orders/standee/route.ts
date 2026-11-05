import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// POST: Create a new physical standee order
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedBizId = searchParams.get("businessId");
    const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";

    let businessId = session.businessId;
    if (isElevated && requestedBizId) {
      businessId = requestedBizId;
    } else if (!businessId) {
      const first = await db.business.findFirst({ orderBy: { createdAt: "desc" } });
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
            where: { id: c.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const order = await db.standeeOrder.create({
      data: {
        businessId,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city ? city.trim() : null,
        postalCode: postalCode ? postalCode.trim() : null,
        standeeType: standeeType || "ACRYLIC_A6",
        quantity: Math.max(1, Number(quantity) || 1),
        totalPrice: finalPrice,
        status: "PENDING",
        courierNotes: courierNotes ? courierNotes.trim() : (validCode ? `Used promo code: ${validCode} (-₹${appliedDiscount})` : null),
      },
      include: {
        business: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully! We will prepare and dispatch your standees.",
      order,
    });
  } catch (err: any) {
    console.error("Create standee order error:", err);
    return NextResponse.json({ error: "Failed to place standee order" }, { status: 500 });
  }
}

// GET: Fetch order history for the authenticated business
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedBizId = searchParams.get("businessId");
    const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";

    let businessId = session.businessId;
    if (isElevated && requestedBizId) {
      businessId = requestedBizId;
    } else if (!businessId) {
      const first = await db.business.findFirst({ orderBy: { createdAt: "desc" } });
      businessId = first?.id || null;
    }

    if (!businessId) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await db.standeeOrder.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Fetch orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
