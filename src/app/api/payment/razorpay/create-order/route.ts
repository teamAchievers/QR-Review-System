import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateSubscription } from "@/lib/subscription";
import { convertFromInr, COUNTRY_TO_CURRENCY_MAP } from "@/lib/currency";
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

    // IP-based fallback if client didn't specify targetCurrency
    const country = (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "IN").toUpperCase();
    const ipCurrency = COUNTRY_TO_CURRENCY_MAP[country] || "USD";

    // DB System Setting preference
    const dbCurrency = await db.systemSetting.findUnique({ where: { key: "payment_currency" } });
    const activeCurrency = (targetCurrency || dbCurrency?.value || ipCurrency || "INR").toUpperCase();

    // Multiplier & exchange rate settings from DB
    const rateSetting = await db.systemSetting.findUnique({ where: { key: "currency_inr_per_usd" } });
    const multSetting = await db.systemSetting.findUnique({ where: { key: "currency_usd_multiplier" } });
    const customInrPerUsd = rateSetting ? Number(rateSetting.value) : undefined;
    const strongerMultiplier = Number(multSetting?.value) || 1.5;

    // Convert from INR using user's rule:
    // If currency > 1 INR -> multiply by 1.5; if weaker -> 1.0 (no multiplier)
    const conversion = convertFromInr(sub.planPrice, activeCurrency, strongerMultiplier, customInrPerUsd);
    const finalPrice = conversion.convertedAmount;

    // Razorpay subunits:
    // Zero-decimal currencies (e.g. JPY) -> unit amount
    // Standard currencies (INR, USD, EUR, GBP) -> 100 subunits (paise / cents)
    const isZeroDecimal = ["JPY", "KRW", "VND", "IDR"].includes(activeCurrency);
    const amountInSubunits = isZeroDecimal ? Math.round(finalPrice) : Math.round(finalPrice * 100);

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
            multiplierApplied: String(conversion.multiplier),
            isStrongerThanInr: String(conversion.isStronger),
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
          multiplier: conversion.multiplier,
          isStronger: conversion.isStronger,
        });
      } catch (err: any) {
        console.warn("Razorpay API order creation failed, falling back to mock mode:", err);
      }
    }

    // Demo / Simulation Mode
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
      multiplier: conversion.multiplier,
      isStronger: conversion.isStronger,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to initialize payment order" }, { status: 500 });
  }
}
