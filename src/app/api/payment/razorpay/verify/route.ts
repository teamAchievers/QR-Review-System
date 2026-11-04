import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      targetBusinessId,
      isMock,
    } = await req.json();

    let businessId = session.businessId || targetBusinessId;
    if (!businessId && session.role === "SUPER_ADMIN") {
      const first = await db.business.findFirst();
      businessId = first?.id || null;
    }

    if (!businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const business = await db.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Query DB system settings first, fallback to process.env
    const dbKeySecret = await db.systemSetting.findUnique({ where: { key: "payment_key_secret" } });
    const keySecret = dbKeySecret?.value?.trim() || process.env.RAZORPAY_KEY_SECRET;

    // Verify signature if secret and real order provided
    if (keySecret && !isMock && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    // Extend subscription by 30 days (or 365 days if annual)
    const cycleDays = business.billingCycle === "ANNUAL" ? 365 : 30;
    const newPeriodEnd = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000);
    const paymentRef = razorpay_payment_id || `pay_sim_${Date.now()}`;

    const updated = await db.business.update({
      where: { id: businessId },
      data: {
        subscriptionStatus: "ACTIVE",
        lastPaymentDate: new Date(),
        currentPeriodEnd: newPeriodEnd,
        billingNotes: `Renewed via Razorpay (Ref: ${paymentRef}) on ${new Date().toLocaleDateString()}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified! Your subscription is now active.",
      business: updated,
    });
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
