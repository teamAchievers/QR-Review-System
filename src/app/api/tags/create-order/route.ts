import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      tagCode,
      planCode = "GROWTH",
      billingCycle = "MONTHLY",
      couponCode,
      customerEmail,
      customerName,
      businessName,
    } = body;

    if (!tagCode) {
      return NextResponse.json({ error: "Hardware tag code is required" }, { status: 400 });
    }

    const cleanCode = tagCode.toUpperCase().trim();
    const tag = await db.smartTag.findUnique({
      where: { tagCode: cleanCode },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not recognized in system" }, { status: 404 });
    }

    if (tag.status === "ASSIGNED") {
      return NextResponse.json({ error: "This tag has already been activated and claimed" }, { status: 400 });
    }

    // Determine Base Price from DB Plan or fallback
    let planPrice = 800; // INR fallback
    const dbPlan = await db.plan.findUnique({
      where: { code: planCode },
    });

    if (dbPlan) {
      planPrice = billingCycle === "ANNUAL" ? dbPlan.annualPrice : dbPlan.monthlyPrice;
    } else {
      if (planCode === "STARTER") planPrice = billingCycle === "ANNUAL" ? 3500 : 350;
      else if (planCode === "PRO") planPrice = billingCycle === "ANNUAL" ? 12000 : 1500;
      else planPrice = billingCycle === "ANNUAL" ? 5000 : 800;
    }

    // Coupon discount calculation
    let discount = 0;
    let validatedCoupon: any = null;

    if (couponCode && typeof couponCode === "string") {
      const cleanCoupon = couponCode.toUpperCase().trim();
      const foundCoupon = await db.coupon.findUnique({
        where: { code: cleanCoupon },
      });

      if (foundCoupon && foundCoupon.isActive) {
        const isExpired = foundCoupon.validUntil && new Date(foundCoupon.validUntil) < new Date();
        const isMaxReached = foundCoupon.maxUses && foundCoupon.usedCount >= foundCoupon.maxUses;
        const meetsMin = !foundCoupon.minOrderValue || planPrice >= foundCoupon.minOrderValue;

        if (!isExpired && !isMaxReached && meetsMin) {
          validatedCoupon = foundCoupon;
          if (foundCoupon.discountType === "PERCENTAGE") {
            discount = (planPrice * foundCoupon.discountValue) / 100;
          } else {
            discount = foundCoupon.discountValue;
          }
          discount = Math.min(planPrice, Math.max(0, discount));
        }
      }
    }

    const payableAmount = Math.max(0, planPrice - discount);

    // If 100% Free Coupon:
    if (payableAmount === 0 && validatedCoupon) {
      return NextResponse.json({
        success: true,
        isFree: true,
        originalPrice: planPrice,
        discountAmount: discount,
        payableAmount: 0,
        couponCode: validatedCoupon.code,
        message: `Coupon "${validatedCoupon.code}" gives 100% discount! No payment needed.`,
      });
    }

    // Fetch Razorpay credentials
    const dbKeyId = await db.systemSetting.findUnique({ where: { key: "payment_key_id" } });
    const dbKeySecret = await db.systemSetting.findUnique({ where: { key: "payment_key_secret" } });
    const dbCurrency = await db.systemSetting.findUnique({ where: { key: "payment_currency" } });

    const keyId = dbKeyId?.value?.trim() || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = dbKeySecret?.value?.trim() || process.env.RAZORPAY_KEY_SECRET;
    const currency = (dbCurrency?.value || "INR").toUpperCase();

    // Standard subunits (100 paise = 1 INR)
    const amountInSubunits = Math.round(payableAmount * 100);

    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInSubunits,
          currency,
          receipt: `tag_${cleanCode.slice(-6)}_${Date.now()}`,
          notes: {
            tagCode: cleanCode,
            planCode,
            billingCycle,
            couponCode: validatedCoupon?.code || "",
            customerEmail: customerEmail || "",
            businessName: businessName || "",
          },
        });

        return NextResponse.json({
          success: true,
          isMock: false,
          orderId: order.id,
          amount: amountInSubunits,
          currency,
          keyId,
          payableAmount,
          originalPrice: planPrice,
          discountAmount: discount,
          couponCode: validatedCoupon?.code,
        });
      } catch (err: any) {
        console.error("Razorpay order creation error:", err);
      }
    }

    // Fallback: Test / Mock Mode when Razorpay live keys are not configured or in test mode
    return NextResponse.json({
      success: true,
      isMock: true,
      orderId: `order_sim_${cleanCode}_${Date.now()}`,
      amount: amountInSubunits,
      currency: "INR",
      keyId: keyId || "rzp_test_mock_standee",
      payableAmount,
      originalPrice: planPrice,
      discountAmount: discount,
      couponCode: validatedCoupon?.code,
    });
  } catch (err: any) {
    console.error("Tag create order error:", err);
    return NextResponse.json({ error: "Failed to initialize checkout order" }, { status: 500 });
  }
}
