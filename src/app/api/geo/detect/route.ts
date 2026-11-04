import { NextRequest, NextResponse } from "next/server";
import {
  COUNTRY_TO_CURRENCY_MAP,
  CURRENCY_METADATA,
  isCurrencyStrongerThanInr,
  getCurrencyMultiplier,
  SupportedCurrency,
} from "@/lib/currency";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Check Vercel and Cloudflare IP Country headers
    let country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      "";

    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "";

    // 2. If running locally or on non-Vercel host without country header, attempt fallback IP lookup
    if (!country && clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1" && !clientIp.startsWith("192.168.")) {
      try {
        const geoRes = await fetch(`https://api.country.is/${clientIp}`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(2000),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData?.country) {
            country = geoData.country;
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
    }

    // Default to "IN" if detection inconclusive
    country = (country || "IN").toUpperCase();

    // 3. Resolve currency for detected country
    const detectedCurrency: SupportedCurrency = COUNTRY_TO_CURRENCY_MAP[country] || "USD";

    // 4. Check if admin configured custom multiplier
    const multSetting = await db.systemSetting.findUnique({ where: { key: "currency_usd_multiplier" } });
    const strongerMultiplier = Number(multSetting?.value) || 1.5;

    const meta = CURRENCY_METADATA[detectedCurrency] || CURRENCY_METADATA["USD"];
    const isStronger = isCurrencyStrongerThanInr(detectedCurrency, meta.inrRate);
    const multiplier = getCurrencyMultiplier(detectedCurrency, strongerMultiplier, meta.inrRate);

    let explanation = "Domestic base rate (INR)";
    if (detectedCurrency !== "INR") {
      if (isStronger) {
        explanation = `Currency value is greater than INR (${meta.inrRate} INR / 1 ${detectedCurrency}) -> Multiplied by ${multiplier}x`;
      } else {
        explanation = `Currency value is weaker than INR (${meta.inrRate} INR / 1 ${detectedCurrency}) -> No multiplier applied (1.0x)`;
      }
    }

    return NextResponse.json({
      success: true,
      country,
      currency: detectedCurrency,
      currencyName: meta.name,
      symbol: meta.symbol,
      inrRate: meta.inrRate,
      isStrongerThanInr: isStronger,
      multiplier,
      explanation,
      clientIp: clientIp || "localhost",
    });
  } catch (err: any) {
    console.error("Geo detect error:", err);
    return NextResponse.json({
      success: false,
      country: "IN",
      currency: "INR",
      currencyName: "Indian Rupee",
      symbol: "₹",
      inrRate: 1.0,
      isStrongerThanInr: false,
      multiplier: 1.0,
      explanation: "Default fallback (India)",
    });
  }
}
