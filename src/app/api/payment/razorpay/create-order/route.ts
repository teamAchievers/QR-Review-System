import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateSubscription } from "@/lib/subscription";
import { convertInrToUsd } from "@/lib/currency";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { targetBusinessId, targetCurrency } = body;

    let businessId = session.businessId;
    if (!businessId && session.role === "SUPER_ADMIN") {
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

    // Determine currency: if requested by client or set in SystemSettings
    const dbCurrency = await db.systemSetting.findUnique({ where: { key: "payment_currency" } });
    const activeCurrency = (targetCurrency || dbCurrency?.value || "INR").toUpperCase();

    // Exchange rate & 1.5x multiplier settings
    const rateSetting = await db.systemSetting.findUnique({ where: { key: "currency_inr_per_usd" } });
    const multSetting = await db.systemSetting.findUnique({ where: { key: "currency_usd_multiplier" } });
    const exchangeRate = Number(rateSetting?.value) || 85;
    const usdMultiplier = Number(multSetting?.value) || 1.5;

    let finalPrice = sub.planPrice || 2999;
    if (activeCurrency === "USD") {
      finalPrice = convertInrToUsd(finalPrice, exchangeRate, usdMultiplier);
    }
    const amountInSubunits = Math.round(finalPrice * 100); // paise (INR) or cents (USD)

    // Query DB system settings first, fallback to process.env
    const dbKeyId = await db.systemSetting.findUnique({ where: { key: "payment_key_id" } });
    const dbKeySecret = await db.systemSetting.findUnique({ where: { key: "payment_key_secret" } });

    const keyId = dbKeyId?.value?.trim() || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = dbKeySecret?.value?.trim() || process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay live/test keys are configured, use official SDK
    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInSubunits,
          currency: activeCurrency,
          receipt: `rcpt_${business.id.slice(-6)}_${Date.now()}`,
          notes: {
            businessId: business.id,
            businessName: business.name,
            planTier: sub.planTier,
            originalInr: String(sub.planPrice),
            multiplier: String(usdMultiplier),
          },
        });

        return NextResponse.json({
          success: true,
          isMock: false,
          orderId: order.id,
          amount: amountInSubunits,
          currency: activeCurrency,
          keyId: keyId,
          businessName: business.name,
          planTier: sub.planTier,
          planPrice: finalPrice,
          originalPrice: sub.planPrice,
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
      currency: activeCurrency,
      keyId: keyId || "rzp_test_demoKey123",
      businessName: business.name,
      planTier: sub.planTier,
      planPrice: finalPrice,
      originalPrice: sub.planPrice,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to initialize payment order" }, { status: 500 });
  }
}
