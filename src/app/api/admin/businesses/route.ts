import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const businesses = await db.business.findMany({
    include: {
      users: { select: { id: true, email: true, name: true } },
      _count: {
        select: {
          feedbacks: true,
          scanLogs: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ businesses });
}

export async function POST(req: NextRequest) {
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
      googlePlaceId,
      googleReviewUrl,
      keywords,
      targetTone,
      adminName,
      adminEmail,
      adminPassword,
      poweredByText = "Unbox Studio",
      poweredByUrl = "https://unboxstudio.com",
      subscriptionStatus = "ACTIVE",
      planTier = "GROWTH",
      billingCycle = "MONTHLY",
      planPrice = 49.0,
    } = await req.json();

    if (!name || !slug || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Missing required fields (name, slug, adminEmail, adminPassword)" }, { status: 400 });
    }

    // Clean slug
    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug or adminEmail already exists
    const existingSlug = await db.business.findUnique({ where: { slug: cleanSlug } });
    if (existingSlug) {
      return NextResponse.json({ error: "A business with this slug already exists" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email: adminEmail.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    // Hash admin password
    const hashedPassword = await hashPassword(adminPassword);

    // Create Business and User inside a transaction
    const result = await db.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          tagline: tagline ? tagline.trim() : null,
          category: category ? category.trim() : null,
          city: city ? city.trim() : null,
          phone: phone ? phone.trim() : null,
          email: email ? email.trim() : null,
          logoUrl: logoUrl ? logoUrl.trim() : null,
          googlePlaceId: googlePlaceId ? googlePlaceId.trim() : null,
          googleReviewUrl: googleReviewUrl ? googleReviewUrl.trim() : (googlePlaceId ? `https://search.google.com/local/writereview?placeid=${googlePlaceId.trim()}` : ""),
          keywords: keywords ? keywords.trim() : "friendly staff, excellent service, great quality, highly recommended",
          targetTone: targetTone || "enthusiastic and authentic",
          status: "ACTIVE",
          poweredByText: poweredByText ? poweredByText.trim() : "Unbox Studio",
          poweredByUrl: poweredByUrl ? poweredByUrl.trim() : "https://unboxstudio.com",
          subscriptionStatus: subscriptionStatus || "ACTIVE",
          planTier: planTier || "GROWTH",
          billingCycle: billingCycle || "MONTHLY",
          planPrice: Number(planPrice) || 49.0,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const user = await tx.user.create({
        data: {
          name: adminName ? adminName.trim() : `${name} Admin`,
          email: adminEmail.toLowerCase().trim(),
          password: hashedPassword,
          role: "BUSINESS_ADMIN",
          businessId: business.id,
        },
      });

      return { business, user };
    });

    return NextResponse.json({
      success: true,
      message: "Business profile and admin user created successfully",
      business: result.business,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (err: any) {
    console.error("Create business error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
