import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Razorpay from "razorpay";

// GET: Retrieve payment configuration
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await db.systemSetting.findMany({
      where: {
        OR: [
          { key: { startsWith: "payment_" } },
          { key: { startsWith: "currency_" } },
        ],
      },
    });

    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    return NextResponse.json({
      config: {
        provider: config["payment_provider"] || "RAZORPAY",
        enabled: config["payment_enabled"] !== "false",
        mode: config["payment_mode"] || "TEST",
        keyId: config["payment_key_id"] || process.env.RAZORPAY_KEY_ID || "",
        keySecret: config["payment_key_secret"] || process.env.RAZORPAY_KEY_SECRET || "",
        webhookSecret: config["payment_webhook_secret"] || "",
        currency: config["payment_currency"] || "INR",
        inrPerUsd: Number(config["currency_inr_per_usd"]) || 85,
        usdMultiplier: Number(config["currency_usd_multiplier"]) || 1.5,
        manualUpiId: config["payment_manual_upi_id"] || "",
        manualBankDetails: config["payment_manual_bank_details"] || "",
        gracePeriodDays: Number(config["payment_grace_period_days"]) || 7,
      },
    });
  } catch (err: any) {
    console.error("Fetch payment config error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Save payment configuration or test credentials
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    // Action: Test credentials
    if (body.action === "TEST_CREDENTIALS") {
      const { keyId, keySecret } = body;
      if (!keyId || !keySecret) {
        return NextResponse.json({ error: "Key ID and Key Secret are required" }, { status: 400 });
      }

      try {
        const instance = new Razorpay({
          key_id: keyId.trim(),
          key_secret: keySecret.trim(),
        });
        // Test call: fetch last order (count: 1)
        await instance.orders.all({ count: 1 });
        return NextResponse.json({
          success: true,
          message: "Razorpay credentials verified successfully! Connection established.",
        });
      } catch (testErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: testErr?.error?.description || testErr?.message || "Invalid Razorpay Key ID or Key Secret",
          },
          { status: 400 }
        );
      }
    }

    // Save configuration settings into SystemSetting
    const {
      provider = "RAZORPAY",
      enabled = true,
      mode = "TEST",
      keyId = "",
      keySecret = "",
      webhookSecret = "",
      currency = "INR",
      inrPerUsd = 85,
      usdMultiplier = 1.5,
      manualUpiId = "",
      manualBankDetails = "",
      gracePeriodDays = 7,
    } = body;

    const pairs = [
      { key: "payment_provider", value: String(provider) },
      { key: "payment_enabled", value: String(enabled) },
      { key: "payment_mode", value: String(mode) },
      { key: "payment_key_id", value: String(keyId).trim() },
      { key: "payment_key_secret", value: String(keySecret).trim() },
      { key: "payment_webhook_secret", value: String(webhookSecret).trim() },
      { key: "payment_currency", value: String(currency).trim() },
      { key: "currency_inr_per_usd", value: String(inrPerUsd) },
      { key: "currency_usd_multiplier", value: String(usdMultiplier) },
      { key: "payment_manual_upi_id", value: String(manualUpiId).trim() },
      { key: "payment_manual_bank_details", value: String(manualBankDetails).trim() },
      { key: "payment_grace_period_days", value: String(gracePeriodDays) },
    ];

    for (const p of pairs) {
      await db.systemSetting.upsert({
        where: { key: p.key },
        update: { value: p.value },
        create: { key: p.key, value: p.value },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment and currency configuration saved successfully!",
    });
  } catch (err: any) {
    console.error("Save payment config error:", err);
    return NextResponse.json({ error: "Failed to save payment configuration" }, { status: 500 });
  }
}
