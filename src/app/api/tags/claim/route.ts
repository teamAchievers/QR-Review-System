import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// POST: Claim / Bind a physical tag to a business (Field Provisioning)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in as an Admin or Business Owner to link this tag" }, { status: 401 });
    }

    const {
      tagCode,
      businessId,
      label,
      newBusiness, // { name, googleReviewUrl, city, phone, category }
    } = await req.json();

    if (!tagCode) {
      return NextResponse.json({ error: "Tag code is required" }, { status: 400 });
    }

    const cleanTag = tagCode.trim().toUpperCase();
    const tag = await db.smartTag.findUnique({
      where: { tagCode: cleanTag },
    });

    if (!tag) {
      return NextResponse.json({ error: "Hardware tag not recognized in database" }, { status: 404 });
    }

    let targetBusinessId = businessId;

    // If fast-onboarding a new business directly from the scan screen
    if (!targetBusinessId && newBusiness && newBusiness.name) {
      const generatedSlug = newBusiness.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substring(2, 6);

      const createdBusiness = await db.business.create({
        data: {
          name: newBusiness.name.trim(),
          slug: generatedSlug,
          googleReviewUrl: newBusiness.googleReviewUrl?.trim() || "",
          city: newBusiness.city?.trim() || null,
          category: newBusiness.category?.trim() || "General Business",
          phone: newBusiness.phone?.trim() || null,
          primaryColor: "#2563eb",
          subscriptionStatus: "ACTIVE",
          planTier: "GROWTH",
        },
      });

      targetBusinessId = createdBusiness.id;
    }

    if (!targetBusinessId) {
      return NextResponse.json({ error: "Please select or create a business to bind this tag to" }, { status: 400 });
    }

    // Verify target business exists
    const business = await db.business.findUnique({
      where: { id: targetBusinessId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Bind tag
    const updated = await db.smartTag.update({
      where: { id: tag.id },
      data: {
        businessId: business.id,
        status: "ASSIGNED",
        assignedAt: new Date(),
        assignedBy: session.email || session.name || "Admin",
        label: label ? label.trim() : tag.label,
      },
      include: {
        business: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Tag "${cleanTag}" is now live and bound to ${business.name}!`,
      tag: updated,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
    });
  } catch (err: any) {
    console.error("Tag claim error:", err);
    return NextResponse.json({ error: "Failed to claim and link hardware tag" }, { status: 500 });
  }
}
