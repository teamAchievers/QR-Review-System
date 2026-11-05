import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, createToken } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

// POST: Claim / Provision a physical hardware tag
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));

    const {
      tagCode,
      claimType = "ADMIN", // "ADMIN_EXISTING" | "ADMIN_NEW" | "CUSTOMER_SIGNUP"
      // Admin Mode:
      businessId,
      newBusiness,
      label,
      // Customer Signup Mode:
      customerSignup,
      planTier = "GROWTH",
      billingCycle = "MONTHLY",
      couponCode,
      payment,
    } = body;

    if (!tagCode) {
      return NextResponse.json({ error: "Hardware tag code is required" }, { status: 400 });
    }

    const cleanTag = tagCode.trim().toUpperCase();
    const tag = await db.smartTag.findUnique({
      where: { tagCode: cleanTag },
    });

    if (!tag) {
      return NextResponse.json({ error: "Hardware tag not recognized in database" }, { status: 404 });
    }

    if (tag.status === "ASSIGNED") {
      return NextResponse.json({ error: "This hardware standee has already been activated" }, { status: 400 });
    }

    // -------------------------------------------------------------
    // PATH 1: CUSTOMER SELF-SERVICE SIGNUP & PAYMENT
    // -------------------------------------------------------------
    if (claimType === "CUSTOMER_SIGNUP" || (!session && customerSignup)) {
      if (!customerSignup?.email || !customerSignup?.password || !customerSignup?.businessName || !customerSignup?.googleReviewUrl) {
        return NextResponse.json({
          error: "Business Name, Google Review Link, Email, and Password are all required.",
        }, { status: 400 });
      }

      const email = customerSignup.email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({
          error: "An account with this email already exists. Please switch to the 'Sign In' tab to activate using your existing account.",
        }, { status: 409 });
      }

      // Verify payment if not marked free coupon
      const isFree = Boolean(payment?.isFree);
      if (!isFree) {
        const dbKeySecret = await db.systemSetting.findUnique({ where: { key: "payment_key_secret" } });
        const keySecret = dbKeySecret?.value?.trim() || process.env.RAZORPAY_KEY_SECRET;

        // If secret exists and signature provided, verify Razorpay signature
        if (keySecret && payment?.razorpay_signature && !payment.isMock) {
          const expectedSig = crypto
            .createHmac("sha256", keySecret)
            .update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`)
            .digest("hex");

          if (expectedSig !== payment.razorpay_signature) {
            return NextResponse.json({ error: "Payment verification failed. Please try again." }, { status: 400 });
          }
        }
      }

      // Generate slug
      const slugBase = customerSignup.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const generatedSlug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

      // Calculate Period End
      const cycleDays = billingCycle === "ANNUAL" ? 365 : 30;
      const currentPeriodEnd = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000);

      // Create Business
      const createdBusiness = await db.business.create({
        data: {
          name: customerSignup.businessName.trim(),
          slug: generatedSlug,
          googleReviewUrl: customerSignup.googleReviewUrl.trim(),
          tripadvisorReviewUrl: customerSignup.tripadvisorReviewUrl?.trim() || null,
          category: customerSignup.category || "General Business",
          city: customerSignup.city?.trim() || null,
          phone: customerSignup.phone?.trim() || null,
          planTier: planTier || "GROWTH",
          billingCycle: billingCycle || "MONTHLY",
          subscriptionStatus: "ACTIVE",
          lastPaymentDate: new Date(),
          currentPeriodEnd,
          billingNotes: isFree
            ? `Activated with 100% Free Coupon (${couponCode || "PROMO"})`
            : `Paid via Online Gateway (${payment?.razorpay_payment_id || "Order Verified"})`,
        },
      });

      // Hash password & create User
      const hashedPassword = await hashPassword(customerSignup.password.trim());
      const createdUser = await db.user.create({
        data: {
          name: customerSignup.name?.trim() || customerSignup.businessName.trim(),
          email,
          password: hashedPassword,
          role: "BUSINESS_ADMIN",
          businessId: createdBusiness.id,
        },
      });

      // Update coupon usage if provided
      if (couponCode) {
        await db.coupon.update({
          where: { code: couponCode.toUpperCase().trim() },
          data: { usedCount: { increment: 1 } },
        }).catch(() => {});
      }

      // Bind Hardware Tag
      await db.smartTag.update({
        where: { id: tag.id },
        data: {
          businessId: createdBusiness.id,
          status: "ASSIGNED",
          assignedAt: new Date(),
          assignedBy: email,
          label: label ? label.trim() : tag.label,
        },
      });

      // Create JWT session cookie so the new customer is automatically logged in
      const token = createToken({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: "BUSINESS_ADMIN",
        businessId: createdBusiness.id,
      });

      const response = NextResponse.json({
        success: true,
        message: `Standee activated! Welcome to SmartReview, ${createdBusiness.name}!`,
        business: {
          id: createdBusiness.id,
          name: createdBusiness.name,
          slug: createdBusiness.slug,
        },
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return response;
    }

    // -------------------------------------------------------------
    // PATH 2: ADMIN PROVISIONING FLOW
    // -------------------------------------------------------------
    if (!session) {
      return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
    }

    let targetBusinessId = businessId;

    // Subcase 2A: Admin creates a NEW Business directly in the field
    if (claimType === "ADMIN_NEW" || (!targetBusinessId && newBusiness?.name)) {
      if (!newBusiness?.name || !newBusiness?.googleReviewUrl) {
        return NextResponse.json({ error: "Business Name and Google Review Link are required" }, { status: 400 });
      }

      const slugBase = newBusiness.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const generatedSlug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

      const isAlreadyPaid = newBusiness.alreadyPaid !== false;
      const cycleDays = newBusiness.billingCycle === "ANNUAL" ? 365 : 30;
      const currentPeriodEnd = isAlreadyPaid
        ? new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000)
        : null;

      const createdBusiness = await db.business.create({
        data: {
          name: newBusiness.name.trim(),
          slug: generatedSlug,
          googleReviewUrl: newBusiness.googleReviewUrl.trim(),
          tripadvisorReviewUrl: newBusiness.tripadvisorReviewUrl?.trim() || null,
          category: newBusiness.category || "General Business",
          city: newBusiness.city?.trim() || null,
          phone: newBusiness.phone?.trim() || null,
          planTier: newBusiness.planTier || "GROWTH",
          billingCycle: newBusiness.billingCycle || "MONTHLY",
          subscriptionStatus: isAlreadyPaid ? "ACTIVE" : "PENDING",
          lastPaymentDate: isAlreadyPaid ? new Date() : null,
          currentPeriodEnd,
          billingNotes: isAlreadyPaid
            ? `Offline / In-Person payment verified by Admin (${session.name || session.email})`
            : "Standee activated with payment pending",
        },
      });

      targetBusinessId = createdBusiness.id;

      // Create Admin login user if provided
      if (newBusiness.email && newBusiness.password) {
        const email = newBusiness.email.toLowerCase().trim();
        const existing = await db.user.findUnique({ where: { email } });
        if (!existing) {
          const hashedPassword = await hashPassword(newBusiness.password.trim());
          await db.user.create({
            data: {
              name: newBusiness.contactName?.trim() || newBusiness.name.trim(),
              email,
              password: hashedPassword,
              role: "BUSINESS_ADMIN",
              businessId: createdBusiness.id,
            },
          });
        }
      }
    }

    if (!targetBusinessId) {
      return NextResponse.json({ error: "Please select an existing business or create a new one" }, { status: 400 });
    }

    // Verify Business
    const business = await db.business.findUnique({
      where: { id: targetBusinessId },
    });

    if (!business) {
      return NextResponse.json({ error: "Selected business could not be found" }, { status: 404 });
    }

    // If Admin marked "Already Paid" for an existing business, update subscription status to ACTIVE
    if (body.alreadyPaid) {
      const cycleDays = business.billingCycle === "ANNUAL" ? 365 : 30;
      await db.business.update({
        where: { id: business.id },
        data: {
          subscriptionStatus: "ACTIVE",
          lastPaymentDate: new Date(),
          currentPeriodEnd: new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000),
          billingNotes: `In-Person / Offline payment verified by Admin on ${new Date().toLocaleDateString()}`,
        },
      });
    }

    // Agent / User identity formatting
    const roleLabel = session.role === "FIELD_AGENT"
      ? "Field Agent"
      : session.role === "AGENT"
      ? "Sales Agent"
      : session.role === "SUPER_ADMIN"
      ? "Super Admin"
      : "Business Admin";
    const agentIdentifier = session.name ? `${session.name} (${roleLabel})` : `${session.email} (${roleLabel})`;

    // Bind the hardware tag
    const updatedTag = await db.smartTag.update({
      where: { id: tag.id },
      data: {
        businessId: business.id,
        status: "ASSIGNED",
        assignedAt: new Date(),
        assignedBy: agentIdentifier,
        label: label ? label.trim() : tag.label,
      },
      include: {
        business: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Hardware standee "${cleanTag}" is now live and bound to ${business.name}!`,
      tag: updatedTag,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
    });
  } catch (err: any) {
    console.error("Tag claim error:", err);
    return NextResponse.json({ error: "Failed to link hardware tag" }, { status: 500 });
  }
}
