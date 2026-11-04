import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateSubscription } from "@/lib/subscription";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let businessId = session.businessId;
    if (!businessId && session.role === "SUPER_ADMIN") {
      const { targetBusinessId } = await req.json().catch(() => ({}));
      businessId = targetBusinessId || (await db.business.findFirst())?.id || null;
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

    const sub = evaluateSubscription(business);
    const amountInCurrency = sub.planPrice || 2999;
    const amountInSubunits = Math.round(amountInCurrency * 100); // 1 INR = 100 paise

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay live/test keys are configured, use official SDK
    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInSubunits,
          currency: sub.currency,
          receipt: `rcpt_${business.id.slice(-6)}_${Date.now()}`,
          notes: {
            businessId: business.id,
            businessName: business.name,
            planTier: sub.planTier,
          },
        });

        return NextResponse.json({
          success: true,
          isMock: false,
          orderId: order.id,
          amount: amountInSubunits,
          currency: sub.currency,
          keyId: keyId,
          businessName: business.name,
          planTier: sub.planTier,
          planPrice: amountInCurrency,
        });
      } catch (err: any) {
        console.warn("Razorpay API order creation failed, falling back to mock mode:", err);
      }
    }

    // Demo / Simulation Mode (when keys not yet configured or testing)
    const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return NextResponse.json({
      success: true,
      isMock: true,
      orderId: mockOrderId,
      amount: amountInSubunits,
      currency: sub.currency,
      keyId: keyId || "rzp_test_demoKey123",
      businessName: business.name,
      planTier: sub.planTier,
      planPrice: amountInCurrency,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to initialize payment order" }, { status: 500 });
  }
}
