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
    const { targetBusinessId, targetCurrency, couponCode } = body;

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

    // Validate Coupon if provided
    let discountInr = 0;
    let validatedCoupon: any = null;

    if (couponCode && typeof couponCode === "string") {
      const cleanCode = couponCode.toUpperCase().trim();
      const foundCoupon = await db.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (foundCoupon && foundCoupon.isActive) {
        const isExpired = foundCoupon.validUntil && new Date(foundCoupon.validUntil) < new Date();
        const isMaxReached = foundCoupon.maxUses && foundCoupon.usedCount >= foundCoupon.maxUses;
        const meetsMin = !foundCoupon.minOrderValue || sub.planPrice >= foundCoupon.minOrderValue;

        if (!isExpired && !isMaxReached && meetsMin) {
          validatedCoupon = foundCoupon;
          if (foundCoupon.discountType === "PERCENTAGE") {
            discountInr = (sub.planPrice * foundCoupon.discountValue) / 100;
          } else {
            discountInr = foundCoupon.discountValue;
          }
          discountInr = Math.min(sub.planPrice, Math.max(0, discountInr));
        }
      }
    }

    const payableInr = Math.max(0, sub.planPrice - discountInr);

    // If 100% discount / free coupon order: instantly activate without hitting gateway
    if (payableInr <= 0 && validatedCoupon) {
      const cycleDays = business.billingCycle === "ANNUAL" ? 365 : 30;
      const newPeriodEnd = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000);

      await db.business.update({
        where: { id: business.id },
        data: {
          subscriptionStatus: "ACTIVE",
          lastPaymentDate: new Date(),
          currentPeriodEnd: newPeriodEnd,
          billingNotes: `Activated with 100% Free Coupon (${validatedCoupon.code}) on ${new Date().toLocaleDateString()}`,
        },
      });

      await db.coupon.update({
        where: { code: validatedCoupon.code },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        isFreeOrder: true,
        message: `Coupon "${validatedCoupon.code}" applied: 100% Discount! Subscription activated for free.`,
        businessName: business.name,
        planTier: sub.planTier,
        planPrice: 0,
        originalPrice: sub.planPrice,
        discountAmount: sub.planPrice,
        couponCode: validatedCoupon.code,
      });
    }

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

    // Convert payable from INR using user's rule:
    // If currency > 1 INR -> multiply by 1.5; if weaker -> 1.0 (no multiplier)
    const conversion = convertFromInr(payableInr, activeCurrency, strongerMultiplier, customInrPerUsd);
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
            discountInr: String(discountInr),
            couponCode: validatedCoupon?.code || "",
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
          discountAmount: discountInr,
          couponCode: validatedCoupon?.code || null,
          couponDescription: validatedCoupon?.description || null,
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
      discountAmount: discountInr,
      couponCode: validatedCoupon?.code || null,
      couponDescription: validatedCoupon?.description || null,
      multiplier: conversion.multiplier,
      isStronger: conversion.isStronger,
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to initialize payment order" }, { status: 500 });
  }
}
