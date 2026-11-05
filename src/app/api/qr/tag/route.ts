import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tagCode = searchParams.get("tagCode");

    if (!tagCode) {
      return NextResponse.json({ error: "tagCode is required" }, { status: 400 });
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const targetUrl = `${protocol}://${host}/t/${tagCode.toUpperCase().trim()}`;

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
