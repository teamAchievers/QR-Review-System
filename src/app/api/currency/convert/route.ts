import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { convertFromInr, CURRENCY_METADATA, isCurrencyStrongerThanInr } from "@/lib/currency";

// GET: /api/currency/convert?amount=1999&to=USD
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amountStr = searchParams.get("amount");
    const to = (searchParams.get("to") || "USD").toUpperCase();

    const amount = Number(amountStr) || 0;

    // Fetch custom settings from DB if configured
    const multSetting = await db.systemSetting.findUnique({ where: { key: "currency_usd_multiplier" } });
    const strongerMultiplier = Number(multSetting?.value) || 1.5;

    // If target is USD and admin set custom inr_per_usd
    let customRate: number | undefined = undefined;
    if (to === "USD") {
      const rateSetting = await db.systemSetting.findUnique({ where: { key: "currency_inr_per_usd" } });
      if (rateSetting?.value) {
        customRate = Number(rateSetting.value);
      }
    }

    const conversion = convertFromInr(amount, to, strongerMultiplier, customRate);
    const meta = CURRENCY_METADATA[to] || CURRENCY_METADATA["USD"];

    return NextResponse.json({
      amountInr: amount,
      targetCurrency: to,
      currencyName: meta.name,
      symbol: meta.symbol,
      convertedAmount: conversion.convertedAmount,
      formatted: conversion.formatted,
      isStrongerThanInr: conversion.isStronger,
      multiplierApplied: conversion.multiplier,
      exchangeRate: conversion.rate,
      ruleApplied: conversion.isStronger
        ? `Currency is stronger than INR (${conversion.rate} INR per 1 ${to}) -> Multiplied by ${conversion.multiplier}x`
        : `Currency is weaker than or equal to INR (${conversion.rate} INR per 1 ${to}) -> No multiplier applied (1.0x)`,
    });
  } catch (err: any) {
    console.error("Currency conversion error:", err);
    return NextResponse.json({ error: "Failed to convert currency" }, { status: 500 });
  }
}
