import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch list of customers/businesses onboarded by the logged-in agent
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";
    if (!isElevated && session.role !== "BUSINESS_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let businesses;

    if (session.role === "SUPER_ADMIN") {
      // Super Admin sees all businesses
      businesses = await db.business.findMany({
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          },
          smartTags: {
            select: { id: true, tagCode: true, type: true, status: true, label: true, scanCount: true, assignedAt: true, assignedBy: true },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              feedbacks: true,
              scanLogs: true,
              smartTags: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // For AGENT and FIELD_AGENT:
      // Filter for businesses onboarded by this agent (via billingNotes, tag assignment, or explicit link)
      const agentIdentifierTag = `[ONBOARDED_BY:${session.id}]`;
      const agentName = session.name ? session.name.trim() : "";
      const agentEmail = session.email ? session.email.trim() : "";

      const whereConditions: any[] = [
        { billingNotes: { contains: agentIdentifierTag } },
      ];

      if (agentEmail) {
        whereConditions.push({ billingNotes: { contains: agentEmail } });
        whereConditions.push({ smartTags: { some: { assignedBy: { contains: agentEmail } } } });
      }

      if (agentName) {
        whereConditions.push({ billingNotes: { contains: agentName } });
        whereConditions.push({ smartTags: { some: { assignedBy: { contains: agentName } } } });
      }

      if (session.businessId) {
        whereConditions.push({ id: session.businessId });
      }

      businesses = await db.business.findMany({
        where: {
          OR: whereConditions,
        },
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          },
          smartTags: {
            select: { id: true, tagCode: true, type: true, status: true, label: true, scanCount: true, assignedAt: true, assignedBy: true },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              feedbacks: true,
              scanLogs: true,
              smartTags: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // If the agent hasn't onboarded any businesses yet, also fetch recent businesses so they have context
      if (businesses.length === 0) {
        const recentFallback = await db.business.findMany({
          take: 5,
          include: {
            users: {
              select: { id: true, name: true, email: true, role: true, createdAt: true },
            },
            smartTags: {
              select: { id: true, tagCode: true, type: true, status: true, label: true, scanCount: true, assignedAt: true, assignedBy: true },
              orderBy: { createdAt: "desc" },
            },
            _count: {
              select: {
                feedbacks: true,
                scanLogs: true,
                smartTags: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        businesses = recentFallback;
      }
    }

    const totalClients = businesses.length;
    const activeSubscriptions = businesses.filter((b) => b.subscriptionStatus === "ACTIVE").length;
    const totalStandeesDeployed = businesses.reduce((acc, b) => acc + (b.smartTags?.length || 0), 0);

    return NextResponse.json({
      clients: businesses,
      metrics: {
        totalClients,
        activeSubscriptions,
        totalStandeesDeployed,
      },
    });
  } catch (err: any) {
    console.error("GET /api/dashboard/clients error:", err);
    return NextResponse.json({ error: "Failed to fetch onboarded clients" }, { status: 500 });
  }
}

// POST: Onboard / Add a new customer & business as an Agent
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";
    if (!isElevated) {
      return NextResponse.json({ error: "Only Agents and Admins can onboard new customers" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug: customSlug,
      category,
      city,
      phone,
      email,
      address,
      googlePlaceId,
      googleReviewUrl,
      keywords,
      planTier = "GROWTH",
      adminName,
      adminEmail,
      adminPassword,
      tagCode,
      tagLabel,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Business Name is required" }, { status: 400 });
    }

    if (!adminEmail || typeof adminEmail !== "string" || !adminEmail.includes("@")) {
      return NextResponse.json({ error: "A valid customer email is required for dashboard login" }, { status: 400 });
    }

    if (!adminPassword || typeof adminPassword !== "string" || adminPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Clean or generate unique slug
    let baseSlug = customSlug && typeof customSlug === "string" && customSlug.trim()
      ? customSlug.trim()
      : name.trim();

    let cleanSlug = baseSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!cleanSlug) cleanSlug = `biz-${Date.now().toString().slice(-6)}`;

    // Check if slug already taken
    const existingSlug = await db.business.findUnique({ where: { slug: cleanSlug } });
    if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Check if user email already exists
    const cleanAdminEmail = adminEmail.toLowerCase().trim();
    const existingUser = await db.user.findUnique({ where: { email: cleanAdminEmail } });
    if (existingUser) {
      return NextResponse.json({
        error: `A user account with email "${cleanAdminEmail}" already exists. Please use a different email or associate with existing user.`,
      }, { status: 400 });
    }

    // Verify tag if provided
    let tagToBind: any = null;
    if (tagCode && typeof tagCode === "string" && tagCode.trim()) {
      const cleanTagCode = tagCode.trim().toUpperCase();
      tagToBind = await db.smartTag.findUnique({
        where: { tagCode: cleanTagCode },
      });
      if (!tagToBind) {
        return NextResponse.json({
          error: `Hardware Tag "${cleanTagCode}" is not found in system stock.`,
        }, { status: 404 });
      }
      if (tagToBind.status === "ASSIGNED" && tagToBind.businessId) {
        return NextResponse.json({
          error: `Hardware Tag "${cleanTagCode}" is already activated for another business.`,
        }, { status: 400 });
      }
    }

    // Agent identity formatting
    const roleTitle = session.role === "FIELD_AGENT"
      ? "Field Agent"
      : session.role === "AGENT"
      ? "Sales Agent"
      : "Super Admin";

    const agentIdentifier = session.name
      ? `${session.name} (${roleTitle})`
      : `${session.email} (${roleTitle})`;

    const onboardingTag = `[ONBOARDED_BY:${session.id}] Onboarded by ${agentIdentifier} on ${new Date().toISOString()}`;

    const hashedPassword = await hashPassword(adminPassword);

    // Compute Google Review link fallback
    const resolvedGoogleUrl = googleReviewUrl && googleReviewUrl.trim()
      ? googleReviewUrl.trim()
      : googlePlaceId && googlePlaceId.trim()
      ? `https://search.google.com/local/writereview?placeid=${googlePlaceId.trim()}`
      : "";

    // Create Business & Customer User in a transaction
    const result = await db.$transaction(async (tx) => {
      const newBusiness = await tx.business.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          category: category ? category.trim() : null,
          city: city ? city.trim() : null,
          phone: phone ? phone.trim() : null,
          email: email ? email.trim() : null,
          address: address ? address.trim() : null,
          googlePlaceId: googlePlaceId ? googlePlaceId.trim() : null,
          googleReviewUrl: resolvedGoogleUrl,
          keywords: keywords && keywords.trim()
            ? keywords.trim()
            : "friendly staff, excellent service, great quality, highly recommended",
          targetTone: "enthusiastic and authentic",
          subscriptionStatus: "ACTIVE",
          planTier: planTier || "GROWTH",
          billingCycle: "MONTHLY",
          planPrice: planTier === "PRO" ? 99.0 : planTier === "STARTER" ? 29.0 : 49.0,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          billingNotes: onboardingTag,
          poweredByText: "Unbox Studio",
          poweredByUrl: "https://unboxstudio.com",
        },
      });

      const newUser = await tx.user.create({
        data: {
          name: adminName && adminName.trim() ? adminName.trim() : `${name.trim()} Owner`,
          email: cleanAdminEmail,
          password: hashedPassword,
          role: "BUSINESS_ADMIN",
          businessId: newBusiness.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      // Bind standee tag if provided
      let boundTag = null;
      if (tagToBind) {
        boundTag = await tx.smartTag.update({
          where: { id: tagToBind.id },
          data: {
            businessId: newBusiness.id,
            status: "ASSIGNED",
            assignedAt: new Date(),
            assignedBy: agentIdentifier,
            label: tagLabel && tagLabel.trim() ? tagLabel.trim() : "Counter Standee",
          },
        });
      }

      return { business: newBusiness, user: newUser, tag: boundTag };
    });

    return NextResponse.json({
      success: true,
      message: `Customer "${result.business.name}" successfully onboarded!`,
      business: result.business,
      user: result.user,
      tag: result.tag,
      reviewUrl: `/r/${result.business.slug}`,
    });
  } catch (err: any) {
    console.error("POST /api/dashboard/clients error:", err);
    return NextResponse.json({ error: err.message || "Failed to onboard customer" }, { status: 500 });
  }
}
