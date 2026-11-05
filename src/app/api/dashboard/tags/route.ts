import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch hardware tags linked to the business
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedBizId = searchParams.get("businessId");
    const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";

    let businessId = session.businessId;
    if (isElevated && requestedBizId) {
      businessId = requestedBizId;
    } else if (!businessId) {
      const first = await db.business.findFirst({ orderBy: { createdAt: "desc" } });
      businessId = first?.id || null;
    }

    if (!businessId) {
      return NextResponse.json({ tags: [] });
    }

    const tags = await db.smartTag.findMany({
      where: { businessId },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({ tags });
  } catch (err: any) {
    console.error("GET /api/dashboard/tags error:", err);
    return NextResponse.json({ error: "Failed to fetch hardware tags" }, { status: 500 });
  }
}

// POST: Activate / link an unassigned hardware standee (NFC + QR) in the field
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tagCode, label, businessId: customBizId } = body;

    if (!tagCode || typeof tagCode !== "string") {
      return NextResponse.json({ error: "Tag Code is required (e.g. TAG-D6D6EE)" }, { status: 400 });
    }

    const cleanCode = tagCode.trim().toUpperCase();

    // Verify tag exists in system
    const existingTag = await db.smartTag.findUnique({
      where: { tagCode: cleanCode },
      include: { business: true },
    });

    if (!existingTag) {
      return NextResponse.json({
        error: `Hardware Tag "${cleanCode}" is not registered in the system inventory.`,
      }, { status: 404 });
    }

    if (existingTag.status === "ASSIGNED" && existingTag.businessId) {
      return NextResponse.json({
        error: `Hardware Tag "${cleanCode}" is already activated for "${existingTag.business?.name || "another client"}".`,
      }, { status: 400 });
    }

    // Determine target business
    const isElevated = session.role === "SUPER_ADMIN" || session.role === "AGENT" || session.role === "FIELD_AGENT";
    let targetBizId = session.businessId;

    if (isElevated && customBizId) {
      targetBizId = customBizId;
    } else if (!targetBizId) {
      const first = await db.business.findFirst({ orderBy: { createdAt: "desc" } });
      targetBizId = first?.id || null;
    }

    if (!targetBizId) {
      return NextResponse.json({ error: "No target business selected" }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { id: targetBizId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Agent identity formatting
    const roleLabel =
      session.role === "FIELD_AGENT"
        ? "Field Agent"
        : session.role === "AGENT"
        ? "Sales Agent"
        : session.role === "SUPER_ADMIN"
        ? "Super Admin"
        : "Business Admin";

    const agentIdentifier = session.name ? `${session.name} (${roleLabel})` : `${session.email} (${roleLabel})`;

    // Activate the hardware tag
    const activatedTag = await db.smartTag.update({
      where: { id: existingTag.id },
      data: {
        businessId: business.id,
        status: "ASSIGNED",
        assignedAt: new Date(),
        assignedBy: agentIdentifier,
        label: label ? label.trim() : (existingTag.label || "Countertop Standee"),
      },
      include: {
        business: {
          select: { id: true, name: true, slug: true, city: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Hardware standee "${cleanCode}" successfully configured and bound to "${business.name}" by ${agentIdentifier}!`,
      tag: activatedTag,
      reviewUrl: `/r/${business.slug}`,
    });
  } catch (err: any) {
    console.error("POST /api/dashboard/tags error:", err);
    return NextResponse.json({ error: err.message || "Failed to configure hardware tag" }, { status: 500 });
  }
}
