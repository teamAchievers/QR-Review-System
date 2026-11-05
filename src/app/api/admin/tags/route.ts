import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

// GET: Fetch all hardware tags with optional filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const batchCode = searchParams.get("batchCode");
    const search = searchParams.get("search")?.trim().toLowerCase();

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (batchCode && batchCode !== "ALL") {
      where.batchCode = batchCode;
    }
    if (search) {
      where.OR = [
        { tagCode: { contains: search, mode: "insensitive" } },
        { batchCode: { contains: search, mode: "insensitive" } },
        { label: { contains: search, mode: "insensitive" } },
        { business: { name: { contains: search, mode: "insensitive" } } },
        { business: { slug: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [tags, totalCount, unassignedCount, assignedCount, batches] = await Promise.all([
      db.smartTag.findMany({
        where,
        include: {
          business: {
            select: { id: true, name: true, slug: true, city: true, category: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 300,
      }),
      db.smartTag.count(),
      db.smartTag.count({ where: { status: "UNASSIGNED" } }),
      db.smartTag.count({ where: { status: "ASSIGNED" } }),
      db.smartTag.findMany({
        select: { batchCode: true },
        distinct: ["batchCode"],
        orderBy: { batchCode: "desc" },
      }),
    ]);

    const totalScans = tags.reduce((acc, t) => acc + (t.scanCount || 0), 0);

    return NextResponse.json({
      tags,
      stats: {
        total: totalCount,
        unassigned: unassignedCount,
        assigned: assignedCount,
        totalScans,
      },
      batches: batches.map((b) => b.batchCode),
    });
  } catch (err: any) {
    console.error("Fetch tags error:", err);
    return NextResponse.json({ error: "Failed to fetch hardware tags" }, { status: 500 });
  }
}

// POST: Bulk generate unassigned QR & NFC hardware tags
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      batchCode = `BATCH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      count = 25,
      type = "QR_NFC",
      prefix = "TAG-",
    } = body;

    const numToGenerate = Math.min(500, Math.max(1, Number(count) || 25));
    const cleanPrefix = (prefix || "TAG-").toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const cleanBatch = (batchCode || "BATCH").toUpperCase().trim();

    const tagRecords: { tagCode: string; batchCode: string; type: string; status: string }[] = [];
    const usedCodes = new Set<string>();

    for (let i = 0; i < numToGenerate; i++) {
      let code = "";
      do {
        const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
        code = `${cleanPrefix}${rand}`;
      } while (usedCodes.has(code));

      usedCodes.add(code);
      tagRecords.push({
        tagCode: code,
        batchCode: cleanBatch,
        type: type || "QR_NFC",
        status: "UNASSIGNED",
      });
    }

    // Insert in bulk
    await db.smartTag.createMany({
      data: tagRecords,
      skipDuplicates: true,
    });

    const createdTags = await db.smartTag.findMany({
      where: { batchCode: cleanBatch },
      orderBy: { createdAt: "desc" },
      take: numToGenerate,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${createdTags.length} unassigned hardware tags in batch ${cleanBatch}`,
      batchCode: cleanBatch,
      count: createdTags.length,
      tags: createdTags,
    });
  } catch (err: any) {
    console.error("Bulk generate tags error:", err);
    return NextResponse.json({ error: "Failed to generate bulk tags" }, { status: 500 });
  }
}

// PATCH: Assign, reassign, label, or unlink a tag
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, tagCode, businessId, label, status } = await req.json();

    if (!id && !tagCode) {
      return NextResponse.json({ error: "Tag ID or Tag Code required" }, { status: 400 });
    }

    const existingTag = await db.smartTag.findFirst({
      where: id ? { id } : { tagCode },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (businessId === null || businessId === "") {
      // Unlink tag
      updateData.businessId = null;
      updateData.status = "UNASSIGNED";
      updateData.assignedAt = null;
      updateData.assignedBy = null;
    } else if (businessId) {
      // Assign or reassign
      const business = await db.business.findUnique({ where: { id: businessId } });
      if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }
      updateData.businessId = businessId;
      updateData.status = "ASSIGNED";
      updateData.assignedAt = new Date();
      updateData.assignedBy = session.email;
    }

    if (label !== undefined) {
      updateData.label = label;
    }
    if (status) {
      updateData.status = status;
    }

    const updated = await db.smartTag.update({
      where: { id: existingTag.id },
      data: updateData,
      include: {
        business: {
          select: { id: true, name: true, slug: true, city: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tag: updated,
    });
  } catch (err: any) {
    console.error("Update tag error:", err);
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

// DELETE: Delete a tag
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing tag ID" }, { status: 400 });
    }

    await db.smartTag.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Tag deleted successfully" });
  } catch (err: any) {
    console.error("Delete tag error:", err);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
