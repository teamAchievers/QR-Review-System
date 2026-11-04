import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { convertCurrency, SupportedCurrency } from "@/lib/currency";

// GET: /api/currency/convert?amount=999&from=INR&to=USD
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amountStr = searchParams.get("amount");
    const from = (searchParams.get("from") || "INR").toUpperCase() as SupportedCurrency;
    const to = (searchParams.get("to") || "USD").toUpperCase() as SupportedCurrency;

    const amount = Number(amountStr) || 0;

    // Fetch exchange rate and multiplier from system settings
    const rateSetting = await db.systemSetting.findUnique({ where: { key: "currency_inr_per_usd" } });
    const multSetting = await db.systemSetting.findUnique({ where: { key: "currency_usd_multiplier" } });

    const exchangeRate = Number(rateSetting?.value) || 85;
    const multiplier = Number(multSetting?.value) || 1.5;

    const converted = convertCurrency(amount, from, to, exchangeRate, multiplier);

    return NextResponse.json({
      amount,
      from,
      to,
      converted,
      exchangeRate,
      multiplier,
      formula: `(amount / ${exchangeRate}) * ${multiplier}`,
    });
  } catch (err: any) {
    console.error("Currency conversion error:", err);
    return NextResponse.json({ error: "Failed to convert currency" }, { status: 500 });
  }
}
