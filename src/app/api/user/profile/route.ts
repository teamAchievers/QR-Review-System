import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, verifyPassword, createToken, UserRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await req.json();

    const user = await db.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (name && typeof name === "string") {
      const cleanName = name.trim();
      if (cleanName.length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
      }
      updateData.name = cleanName;
    }

    if (email && typeof email === "string" && email.includes("@")) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== user.email) {
        const existing = await db.user.findUnique({ where: { email: cleanEmail } });
        if (existing && existing.id !== user.id) {
          return NextResponse.json({ error: "Email address is already in use by another account" }, { status: 400 });
        }
        updateData.email = cleanEmail;
      }
    }

    // Handle password change
    if (newPassword && typeof newPassword === "string") {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }

      // If currentPassword is provided, verify it
      if (currentPassword) {
        const isMatch = await verifyPassword(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }

      updateData.password = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Re-issue updated JWT session token
    const token = createToken({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as UserRole,
      businessId: updatedUser.businessId,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("PUT /api/user/profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
