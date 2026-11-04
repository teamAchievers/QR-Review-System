import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: All physical standee orders across businesses for Master Admin
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orders = await db.standeeOrder.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            primaryColor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Admin standee orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// PATCH: Update order status or tracking number
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, status, trackingNumber, courierNotes } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const updated = await db.standeeOrder.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(courierNotes !== undefined && { courierNotes }),
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Update standee order error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
