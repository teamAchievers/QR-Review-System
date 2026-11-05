import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, UserRole } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_ROLES: UserRole[] = ["AGENT", "FIELD_AGENT", "BUSINESS_ADMIN", "SUPER_ADMIN"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, email, password, role, businessId } = body;

    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name && typeof name === "string") {
      updateData.name = name.trim();
    }

    if (email && typeof email === "string" && email.includes("@")) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== existingUser.email) {
        const taken = await db.user.findUnique({ where: { email: cleanEmail } });
        if (taken) {
          return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
        }
        updateData.email = cleanEmail;
      }
    }

    if (role && VALID_ROLES.includes(role as UserRole)) {
      updateData.role = role;
    }

    if (password && typeof password === "string" && password.length >= 6) {
      updateData.password = await hashPassword(password);
    }

    if (businessId !== undefined) {
      if (!businessId || businessId === "NONE" || businessId === "UNASSIGNED") {
        updateData.businessId = null;
      } else {
        const biz = await db.business.findUnique({ where: { id: businessId } });
        if (biz) {
          updateData.businessId = biz.id;
        }
      }
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessId: true,
        business: {
          select: { id: true, name: true, slug: true },
        },
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    // Prevent deleting own session
    if (session.id === id) {
      return NextResponse.json({ error: "Cannot delete your own active administrator account" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
