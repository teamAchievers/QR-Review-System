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
    } = await req.json();

    if (!contactName || !contactPhone || !shippingAddress) {
      return NextResponse.json({ error: "Missing required shipping information" }, { status: 400 });
    }

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
        totalPrice: Number(totalPrice) || 499,
        status: "PENDING",
        courierNotes: courierNotes || "",
      },
    });

    return NextResponse.json({ success: true, order });
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
