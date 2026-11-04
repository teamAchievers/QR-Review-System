import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const format = searchParams.get("format") || "dataurl"; // "dataurl" | "svg" | "png"
    const platform = (searchParams.get("platform") || "google").toLowerCase(); // "google" | "tripadvisor"
    const isXl = searchParams.get("size") === "xl";

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Fetch business details for branding
    const [business, globalTripadvisor] = await Promise.all([
      db.business.findUnique({
        where: { slug },
        select: {
          name: true,
          logoUrl: true,
          primaryColor: true,
          poweredByText: true,
          reviewPlatform: true,
          tripadvisorEnabled: true,
        },
      }),
      db.systemSetting.findUnique({
        where: { key: "enableTripadvisor" },
      }),
    ]);

    const isTripadvisorAllowed = (globalTripadvisor?.value !== "false") && (business?.tripadvisorEnabled ?? true);
    const effectivePlatform = (platform === "tripadvisor" && isTripadvisorAllowed) ? "tripadvisor" : "google";

    const businessName = business?.name || "Business";
    const initial = businessName.charAt(0).toUpperCase() || "B";
    const brandColor = business?.primaryColor || "#2563eb";
    const logoUrl = business?.logoUrl || null;
    const poweredBy = business?.poweredByText?.trim() || "Unbox Studio";

    // Determine the base URL & target URL
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const targetUrl = effectivePlatform === "tripadvisor"
      ? `${protocol}://${host}/r/${slug}?platform=tripadvisor`
      : `${protocol}://${host}/r/${slug}`;

    // Generate QR matrix SVG with High Error Correction ('H' = ~30% recovery)
    // High error correction guarantees 100% fast scanability even with a large bold center logo
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
    const viewBoxMatch = rawQrSvg.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 33 33";
    const innerContent = rawQrSvg.replace(/<svg[^>]*>|<\/svg>/g, "");

    // Large, prominent center logo dimensions
    // Default: 56px outer radius (112px diameter) / 48px inner radius (96px logo)
    // XL: 64px outer radius (128px diameter) / 54px inner radius (108px logo)
    const outerR = isXl ? 64 : 56;
    const innerR = isXl ? 54 : 48;
    const imgSize = innerR * 2;
    const rectOuterSize = isXl ? 124 : 110;
    const rectInnerSize = isXl ? 104 : 92;
    const initialFontSize = isXl ? 54 : 48;
    const initialYOffset = isXl ? 19 : 17;
    const owlScale = isXl ? 1.6 : 1.4;

    // Build center logo SVG elements
    let centerLogoElement: string;
    if (logoUrl) {
      const strokeColor = effectivePlatform === "tripadvisor" ? "#00aa6c" : "#e2e8f0";
      centerLogoElement = `
        <clipPath id="logo-circle-clip">
          <circle cx="0" cy="0" r="${innerR}" />
        </clipPath>
        <!-- Outer White Glow & Ring -->
        <circle cx="0" cy="0" r="${outerR}" fill="#ffffff" stroke="${strokeColor}" stroke-width="4.5" filter="url(#center-shadow)"/>
        <!-- High-Resolution Center Logo Image -->
        <image href="${logoUrl}" x="-${innerR}" y="-${innerR}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#logo-circle-clip)"/>
      `;
    } else if (effectivePlatform === "tripadvisor") {
      // Official TripAdvisor Owl Emblem (Large, bold & crisp)
      centerLogoElement = `
        <circle cx="0" cy="0" r="${outerR}" fill="#ffffff" stroke="#00aa6c" stroke-width="4.5" filter="url(#center-shadow)"/>
        <circle cx="0" cy="0" r="${innerR}" fill="#00aa6c"/>
        <g transform="scale(${owlScale})">
          <!-- TripAdvisor Owl Eyes -->
          <circle cx="-13" cy="-3" r="11" fill="#ffffff"/>
          <circle cx="13" cy="-3" r="11" fill="#ffffff"/>
          <circle cx="-13" cy="-3" r="5" fill="#0f172a"/>
          <circle cx="13" cy="-3" r="5" fill="#0f172a"/>
          <circle cx="-15" cy="-5" r="2" fill="#ffffff"/>
          <circle cx="11" cy="-5" r="2" fill="#ffffff"/>
          <!-- Bridge & Beak -->
          <path d="M -8 -8 C -4 -12 4 -12 8 -8" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <polygon points="0,0 -4,7 4,7" fill="#f59e0b"/>
        </g>
      `;
    } else {
      centerLogoElement = `
        <rect x="-${rectOuterSize / 2}" y="-${rectOuterSize / 2}" width="${rectOuterSize}" height="${rectOuterSize}" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="4.5" filter="url(#center-shadow)"/>
        <rect x="-${rectInnerSize / 2}" y="-${rectInnerSize / 2}" width="${rectInnerSize}" height="${rectInnerSize}" rx="22" fill="${brandColor}"/>
        <text x="0" y="${initialYOffset}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${initialFontSize}" font-weight="900" fill="#ffffff">${initial}</text>
      `;
    }

    const footerText = effectivePlatform === "tripadvisor"
      ? `<text x="0" y="2" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#475569">
          Review us on <tspan font-weight="800" fill="#00aa6c">TripAdvisor</tspan> • <tspan font-weight="700" fill="#0f172a">${poweredBy}</tspan>
        </text>`
      : `<text x="0" y="2" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#64748b">
          Powered by <tspan font-weight="800" fill="#0f172a">${poweredBy}</tspan>
        </text>`;

    const footerWidth = effectivePlatform === "tripadvisor" ? 280 : 230;

    // Compose full SVG with QR + Center Logo + Footer badge
    const compositeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 560" width="500" height="560">
  <defs>
    <filter id="center-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16" />
    </filter>
  </defs>

  <!-- Clean Background Card -->
  <rect width="500" height="560" fill="#ffffff" rx="24"/>

  <!-- The High-Error-Correction QR Code Matrix -->
  <svg x="25" y="20" width="450" height="450" viewBox="${viewBox}" shape-rendering="crispEdges">
    ${innerContent}
  </svg>

  <!-- Center Business Logo / TripAdvisor Badge (Center at x=250, y=245) -->
  <g transform="translate(250, 245)">
    ${centerLogoElement}
  </g>

  <!-- Footer Badge at Bottom of QR Code -->
  <g transform="translate(250, 510)">
    <rect x="-${footerWidth / 2}" y="-18" width="${footerWidth}" height="32" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
    ${footerText}
  </g>
</svg>`.trim();

    if (format === "svg") {
      return new NextResponse(compositeSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="qr-${slug}-${effectivePlatform}.svg"`,
        },
      });
    }

    if (format === "png") {
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
          "Content-Disposition": `attachment; filename="qr-${slug}-${effectivePlatform}.png"`,
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
      platform: effectivePlatform,
    });
  } catch (err: any) {
    console.error("QR Code generation error:", err);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
