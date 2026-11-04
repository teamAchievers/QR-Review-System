import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const format = searchParams.get("format") || "dataurl"; // "dataurl" | "svg" | "png"

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Fetch business details for branding
    const business = await db.business.findUnique({
      where: { slug },
      select: {
        name: true,
        logoUrl: true,
        primaryColor: true,
        poweredByText: true,
      },
    });

    const businessName = business?.name || "Business";
    const initial = businessName.charAt(0).toUpperCase() || "B";
    const brandColor = business?.primaryColor || "#2563eb";
    const logoUrl = business?.logoUrl || null;
    const poweredBy = business?.poweredByText?.trim() || "Unbox Studio";

    // Determine the base URL
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const targetUrl = `${protocol}://${host}/r/${slug}`;

    // Generate QR matrix SVG with High Error Correction ('H' = ~30% recovery)
    // High error correction guarantees scanability even with the center logo
    const rawQrSvg = await QRCode.toString(targetUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    // Extract the inner path / content of the generated QR SVG
    // QRCode.toString returns <svg viewBox="0 0 N N" ...><path .../><path .../></svg>
    const viewBoxMatch = rawQrSvg.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 33 33";
    const innerContent = rawQrSvg.replace(/<svg[^>]*>|<\/svg>/g, "");

    // Build center logo SVG elements
    let centerLogoElement: string;
    if (logoUrl) {
      centerLogoElement = `
        <clipPath id="logo-circle-clip">
          <circle cx="0" cy="0" r="34" />
        </clipPath>
        <circle cx="0" cy="0" r="42" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" filter="url(#center-shadow)"/>
        <image href="${logoUrl}" x="-34" y="-34" width="68" height="68" preserveAspectRatio="xMidYMid slice" clip-path="url(#logo-circle-clip)"/>
      `;
    } else {
      centerLogoElement = `
        <rect x="-40" y="-40" width="80" height="80" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" filter="url(#center-shadow)"/>
        <rect x="-33" y="-33" width="66" height="66" rx="15" fill="${brandColor}"/>
        <text x="0" y="12" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#ffffff">${initial}</text>
      `;
    }

    // Compose full SVG with QR + Center Logo + "Powered by Unbox Studio" footer
    const compositeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 560" width="500" height="560">
  <defs>
    <filter id="center-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Clean Background Card -->
  <rect width="500" height="560" fill="#ffffff" rx="24"/>

  <!-- The High-Error-Correction QR Code Matrix -->
  <svg x="25" y="20" width="450" height="450" viewBox="${viewBox}" shape-rendering="crispEdges">
    ${innerContent}
  </svg>

  <!-- Center Business Logo Badge (Center at x=250, y=245) -->
  <g transform="translate(250, 245)">
    ${centerLogoElement}
  </g>

  <!-- "Powered by" Footer Badge at Bottom of QR Code -->
  <g transform="translate(250, 510)">
    <rect x="-115" y="-18" width="230" height="32" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="0" y="2" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#64748b">
      Powered by <tspan font-weight="800" fill="#0f172a">${poweredBy}</tspan>
    </text>
  </g>
</svg>`.trim();

    if (format === "svg") {
      return new NextResponse(compositeSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="qr-${slug}.svg"`,
        },
      });
    }

    if (format === "png") {
      // Return standard high-res QR png buffer with high error correction
      // and allow client-side canvas to download the full graphic
      const buffer = await QRCode.toBuffer(targetUrl, {
        width: 600,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="qr-${slug}.png"`,
        },
      });
    }

    // Default: Return data URL with embedded SVG
    const base64Svg = Buffer.from(compositeSvg).toString("base64");
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return NextResponse.json({
      targetUrl,
      dataUrl,
      svg: compositeSvg,
    });
  } catch (err: any) {
    console.error("QR Code generation error:", err);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
