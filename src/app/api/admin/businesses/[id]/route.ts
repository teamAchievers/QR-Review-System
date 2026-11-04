import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const business = await db.business.findUnique({
      where: { id: params.id },
      include: {
        users: { select: { id: true, email: true, name: true } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (err: any) {
    console.error("Fetch business error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      name,
      slug,
      tagline,
      category,
      city,
      phone,
      email,
      logoUrl,
      status,
      googleReviewUrl,
      googlePlaceId,
      keywords,
      targetTone,
      minGoogleStar,
      adminUserId,
      adminName,
      adminEmail,
      adminPassword,
      // Subscription Lifecycle Fields
      subscriptionStatus,
      planTier,
      billingCycle,
      planPrice,
      currentPeriodEnd,
      billingNotes,
      renewSubscription,
    } = await req.json();

    const existingBusiness = await db.business.findUnique({
      where: { id: params.id },
      include: { users: true },
    });

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // If slug changed, verify uniqueness
    let cleanSlug = existingBusiness.slug;
    if (slug && slug.trim() !== existingBusiness.slug) {
      cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
      const duplicateSlug = await db.business.findFirst({
        where: { slug: cleanSlug, NOT: { id: params.id } },
      });
      if (duplicateSlug) {
        return NextResponse.json({ error: "This slug is already in use by another business" }, { status: 400 });
      }
    }

    // Build subscription updates
    const subscriptionUpdates: any = {};
    if (subscriptionStatus !== undefined) subscriptionUpdates.subscriptionStatus = subscriptionStatus;
    if (planTier !== undefined) subscriptionUpdates.planTier = planTier;
    if (billingCycle !== undefined) subscriptionUpdates.billingCycle = billingCycle;
    if (planPrice !== undefined) subscriptionUpdates.planPrice = Number(planPrice);
    if (currentPeriodEnd !== undefined) {
      subscriptionUpdates.currentPeriodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
    }
    if (billingNotes !== undefined) subscriptionUpdates.billingNotes = billingNotes;

    // Quick Renewal Action
    if (renewSubscription) {
      subscriptionUpdates.subscriptionStatus = "ACTIVE";
      subscriptionUpdates.lastPaymentDate = new Date();
      const cycleDays = existingBusiness.billingCycle === "ANNUAL" ? 365 : 30;
      subscriptionUpdates.currentPeriodEnd = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000);
    }

    // Update business details
    const updatedBusiness = await db.business.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(cleanSlug !== undefined && { slug: cleanSlug }),
        ...(tagline !== undefined && { tagline: tagline?.trim() || null }),
        ...(category !== undefined && { category: category?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(googleReviewUrl !== undefined && { googleReviewUrl: googleReviewUrl.trim() }),
        ...(googlePlaceId !== undefined && { googlePlaceId: googlePlaceId?.trim() || null }),
        ...(keywords !== undefined && { keywords: keywords.trim() }),
        ...(targetTone !== undefined && { targetTone: targetTone.trim() }),
        ...(minGoogleStar !== undefined && { minGoogleStar: Number(minGoogleStar) }),
        ...subscriptionUpdates,
      },
    });

    // Update or create associated admin user if provided
    const targetUserId = adminUserId || existingBusiness.users[0]?.id;

    if (targetUserId) {
      // Check if email changed and if duplicate
      if (adminEmail && adminEmail.toLowerCase().trim() !== existingBusiness.users[0]?.email) {
        const duplicateUser = await db.user.findFirst({
          where: {
            email: adminEmail.toLowerCase().trim(),
            NOT: { id: targetUserId },
          },
        });
        if (duplicateUser) {
          return NextResponse.json({ error: "This email is already in use by another user" }, { status: 400 });
        }
      }

      const userDataToUpdate: any = {};
      if (adminName) userDataToUpdate.name = adminName.trim();
      if (adminEmail) userDataToUpdate.email = adminEmail.toLowerCase().trim();
      if (adminPassword && adminPassword.trim().length > 0) {
        userDataToUpdate.password = await hashPassword(adminPassword.trim());
      }

      if (Object.keys(userDataToUpdate).length > 0) {
        await db.user.update({
          where: { id: targetUserId },
          data: userDataToUpdate,
        });
      }
    } else if (adminEmail && adminPassword) {
      // If no admin user existed, create one
      const hashedPassword = await hashPassword(adminPassword.trim());
      await db.user.create({
        data: {
          name: adminName ? adminName.trim() : `${updatedBusiness.name} Admin`,
          email: adminEmail.toLowerCase().trim(),
          password: hashedPassword,
          role: "BUSINESS_ADMIN",
          businessId: updatedBusiness.id,
        },
      });
    }

    // Return refreshed business
    const refreshed = await db.business.findUnique({
      where: { id: params.id },
      include: {
        users: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Business and user profile updated successfully",
      business: refreshed,
    });
  } catch (err: any) {
    console.error("Update business error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.business.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Business deleted" });
  } catch (err: any) {
    console.error("Delete business error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
