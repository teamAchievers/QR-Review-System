import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch system settings (global default Powered by, TripAdvisor switch, etc.)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await db.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      settings: {
        poweredByText: settingsMap["defaultPoweredByText"] || "Unbox Studio",
        poweredByUrl: settingsMap["defaultPoweredByUrl"] || "https://unboxstudio.com",
        enableTripadvisor: settingsMap["enableTripadvisor"] !== "false", // Default true
      },
    });
  } catch (err: any) {
    console.error("Fetch settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Update system settings (global default Powered by, TripAdvisor switch)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { poweredByText, poweredByUrl, enableTripadvisor, applyToAllBusinesses } = await req.json();

    if (poweredByText !== undefined) {
      await db.systemSetting.upsert({
        where: { key: "defaultPoweredByText" },
        update: { value: poweredByText.trim() },
        create: { key: "defaultPoweredByText", value: poweredByText.trim() },
      });
    }

    if (poweredByUrl !== undefined) {
      await db.systemSetting.upsert({
        where: { key: "defaultPoweredByUrl" },
        update: { value: poweredByUrl.trim() },
        create: { key: "defaultPoweredByUrl", value: poweredByUrl.trim() },
      });
    }

    if (enableTripadvisor !== undefined) {
      await db.systemSetting.upsert({
        where: { key: "enableTripadvisor" },
        update: { value: enableTripadvisor ? "true" : "false" },
        create: { key: "enableTripadvisor", value: enableTripadvisor ? "true" : "false" },
      });
    }

    // Optionally propagate branding to all existing businesses
    if (applyToAllBusinesses) {
      await db.business.updateMany({
        data: {
          ...(poweredByText && { poweredByText: poweredByText.trim() }),
          ...(poweredByUrl && { poweredByUrl: poweredByUrl.trim() }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "System settings updated successfully",
      settings: {
        poweredByText: poweredByText || "Unbox Studio",
        poweredByUrl: poweredByUrl || "https://unboxstudio.com",
        enableTripadvisor: enableTripadvisor !== undefined ? Boolean(enableTripadvisor) : true,
      },
    });
  } catch (err: any) {
    console.error("Update settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
