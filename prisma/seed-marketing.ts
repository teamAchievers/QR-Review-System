import { db } from "../src/lib/db";

async function main() {
  const pCount = await db.plan.count();
  if (pCount === 0) {
    await db.plan.createMany({
      data: [
        {
          code: "STARTER",
          name: "Starter Launch",
          description: "Perfect for single location cafes, clinics, and studios",
          monthlyPrice: 999,
          annualPrice: 9999,
          features: "1 Branded Center-Logo QR Code\nUnlimited Customer Scans\nPrivate Negative Feedback Shield\nBasic Keyword Weaving\nPrintable Table Tent / Standee",
          isPopular: false,
          sortOrder: 1,
        },
        {
          code: "GROWTH",
          name: "Growth Pro",
          description: "Best for fast-growing local businesses seeking 5-star Google dominance",
          monthlyPrice: 1999,
          annualPrice: 19999,
          features: "Everything in Starter\nAI Keyword Optimization (Gemini)\nNiche Highlight Pills & Smart Placeholders\nMulti-Variation Review Copying\n1 Free Premium Acrylic Standee Shipped\nPriority WhatsApp Support",
          isPopular: true,
          sortOrder: 2,
        },
        {
          code: "PRO",
          name: "Enterprise Elite",
          description: "For multi-location chains, premium franchises, and agencies",
          monthlyPrice: 3999,
          annualPrice: 39999,
          features: "Everything in Growth\nUp to 5 Custom Physical Standees Delivered\nMulti-Location Dashboard Access\nMonthly Local SEO & Reputation Audit\nDedicated Account Manager\nCustom Domain White-Label Option",
          isPopular: false,
          sortOrder: 3,
        },
      ],
    });
  }

  const cCount = await db.coupon.count();
  if (cCount === 0) {
    await db.coupon.createMany({
      data: [
        {
          code: "UNBOX50",
          description: "50% off for new business owners",
          discountType: "PERCENTAGE",
          discountValue: 50,
          maxUses: 100,
        },
        {
          code: "WELCOME20",
          description: "20% off any subscription tier",
          discountType: "PERCENTAGE",
          discountValue: 20,
          maxUses: 500,
        },
        {
          code: "FREESTANDEE",
          description: "Flat Rs 499 off physical standee orders",
          discountType: "FLAT",
          discountValue: 499,
          maxUses: 200,
        },
      ],
    });
  }

  const oCount = await db.offer.count();
  if (oCount === 0) {
    await db.offer.createMany({
      data: [
        {
          title: "Special Launch Offer: Free Custom Standee with Annual Plan",
          subtitle: "Order any Annual subscription and receive a handcrafted premium acrylic standee delivered to your storefront.",
          badgeText: "LIMITED TIME",
          bannerColor: "#2563eb",
          couponCode: "FREESTANDEE",
          ctaText: "Claim Free Standee",
          ctaLink: "/dashboard?tab=billing",
        },
        {
          title: "Grow Your Reviews: 50% Off First 3 Months",
          subtitle: "Use coupon code UNBOX50 during onboarding to unlock full Growth Pro features at half price.",
          badgeText: "POPULAR",
          bannerColor: "#7c3aed",
          couponCode: "UNBOX50",
          ctaText: "Apply Coupon",
          ctaLink: "/dashboard?tab=billing",
        },
      ],
    });
  }

  console.log("Seeded plans, coupons, and offers successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
