import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tagCode = searchParams.get("tagCode");

    if (!tagCode) {
      return NextResponse.json({ error: "tagCode is required" }, { status: 400 });
    }

    // Determine target URL base:
    // 1. Explicit NEXT_PUBLIC_APP_URL if defined
    // 2. Vercel production canonical domain if defined
    // 3. Fallback to request host headers
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!baseUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
      baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
    }
    if (!baseUrl) {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      baseUrl = `${protocol}://${host}`;
    }
    baseUrl = baseUrl.replace(/\/+$/, "");

    const targetUrl = `${baseUrl}/t/${tagCode.toUpperCase().trim()}`;

    // Generate high resolution QR code data URL
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });

    return NextResponse.json({
      tagCode: tagCode.toUpperCase().trim(),
      targetUrl,
      qrDataUrl,
    });
  } catch (err: any) {
    console.error("Tag QR error:", err);
    return NextResponse.json({ error: "Failed to generate Tag QR" }, { status: 500 });
  }
}
