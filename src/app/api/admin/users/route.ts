import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, UserRole } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_ROLES: UserRole[] = ["AGENT", "FIELD_AGENT", "BUSINESS_ADMIN", "SUPER_ADMIN"];

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    const whereClause: any = {};
    if (roleFilter && VALID_ROLES.includes(roleFilter as UserRole)) {
      whereClause.role = roleFilter;
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessId: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute aggregated role stats
    const allUsers = await db.user.findMany({
      select: { role: true },
    });

    const stats = {
      total: allUsers.length,
      agents: allUsers.filter((u) => u.role === "AGENT").length,
      fieldAgents: allUsers.filter((u) => u.role === "FIELD_AGENT").length,
      businessAdmins: allUsers.filter((u) => u.role === "BUSINESS_ADMIN").length,
      superAdmins: allUsers.filter((u) => u.role === "SUPER_ADMIN").length,
    };

    return NextResponse.json({ users, stats });
  } catch (err: any) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role = "AGENT", businessId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already in use
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Verify business if provided
    let verifiedBusinessId: string | null = null;
    if (businessId && businessId !== "NONE" && businessId !== "UNASSIGNED") {
      const biz = await db.business.findUnique({
        where: { id: businessId },
        select: { id: true },
      });
      if (biz) {
        verifiedBusinessId = biz.id;
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role as string,
        businessId: verifiedBusinessId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessId: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${role === "AGENT" ? "Agent" : role === "FIELD_AGENT" ? "Field Agent" : role} user created successfully`,
      user: newUser,
    });
  } catch (err: any) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}
