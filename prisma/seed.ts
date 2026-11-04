import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with subscription tiers & statuses...");

  // 1. Create Super Admin
  const hashedSuperPassword = await bcrypt.hash("AdminPassword123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@smartreview.io" },
    update: {},
    create: {
      email: "admin@smartreview.io",
      name: "Master Admin",
      password: hashedSuperPassword,
      role: "SUPER_ADMIN",
    },
  });

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

  // 2. Business 1: Apex Dental (ACTIVE subscription)
  const dentalBusiness = await prisma.business.upsert({
    where: { slug: "apex-dental" },
    update: {
      subscriptionStatus: "ACTIVE",
      planTier: "GROWTH",
      billingCycle: "MONTHLY",
      planPrice: 79.0,
      currentPeriodEnd: nextMonth,
      lastPaymentDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      billingNotes: "Autopay active via credit card",
    },
    create: {
      name: "Apex Dental Care",
      slug: "apex-dental",
      tagline: "Gentle, Modern Dental Care & Smile Transformations",
      category: "Dental Clinic",
      city: "Seattle, WA",
      phone: "(206) 555-0199",
      email: "contact@apexdental.com",
      primaryColor: "#0284c7",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      keywords: "painless dental cleaning, Invisalign specialist, friendly dentists, emergency tooth repair, state-of-the-art clinic",
      targetTone: "warm, reassuring, and highly professional",
      minGoogleStar: 4,
      subscriptionStatus: "ACTIVE",
      planTier: "GROWTH",
      billingCycle: "MONTHLY",
      planPrice: 79.0,
      currentPeriodEnd: nextMonth,
      lastPaymentDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      billingNotes: "Autopay active via credit card",
    },
  });

  const hashedDentalPassword = await bcrypt.hash("Dental123!", 10);
  await prisma.user.upsert({
    where: { email: "owner@apexdental.com" },
    update: { businessId: dentalBusiness.id },
    create: {
      email: "owner@apexdental.com",
      name: "Dr. Sarah Mitchell",
      password: hashedDentalPassword,
      role: "BUSINESS_ADMIN",
      businessId: dentalBusiness.id,
    },
  });

  // 3. Business 2: Bella Napoli Pizza (DUE subscription)
  const pizzaBusiness = await prisma.business.upsert({
    where: { slug: "bella-napoli" },
    update: {
      subscriptionStatus: "DUE",
      planTier: "STARTER",
      billingCycle: "MONTHLY",
      planPrice: 49.0,
      currentPeriodEnd: twoDaysAgo,
      billingNotes: "Renewal notice sent via email on Nov 2nd",
    },
    create: {
      name: "Bella Napoli Wood-Fired Pizza",
      slug: "bella-napoli",
      tagline: "Authentic Neapolitan Pizza & Handmade Pastas",
      category: "Italian Restaurant",
      city: "Austin, TX",
      phone: "(512) 555-0811",
      email: "ciao@bellanapoli.com",
      primaryColor: "#ea580c",
      googlePlaceId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJdd4hrwug2EcRmSrV3Vo6llI",
      keywords: "crispy wood-fired crust, truffle pasta, best authentic Italian pizza, warm welcoming atmosphere, craft cocktails",
      targetTone: "enthusiastic, foodie-friendly, and vibrant",
      minGoogleStar: 4,
      subscriptionStatus: "DUE",
      planTier: "STARTER",
      billingCycle: "MONTHLY",
      planPrice: 49.0,
      currentPeriodEnd: twoDaysAgo,
      billingNotes: "Renewal notice sent via email on Nov 2nd",
    },
  });

  const hashedPizzaPassword = await bcrypt.hash("Pizza123!", 10);
  await prisma.user.upsert({
    where: { email: "mario@bellanapoli.com" },
    update: { businessId: pizzaBusiness.id },
    create: {
      email: "mario@bellanapoli.com",
      name: "Mario Rossi",
      password: hashedPizzaPassword,
      role: "BUSINESS_ADMIN",
      businessId: pizzaBusiness.id,
    },
  });

  // 4. Business 3: Oasis Wellness & Spa (SUSPENDED subscription)
  const spaBusiness = await prisma.business.upsert({
    where: { slug: "oasis-spa" },
    update: {
      subscriptionStatus: "SUSPENDED",
      planTier: "STARTER",
      billingCycle: "MONTHLY",
      planPrice: 49.0,
      currentPeriodEnd: fifteenDaysAgo,
      billingNotes: "Account suspended past grace period. Contact client.",
    },
    create: {
      name: "Oasis Wellness & Day Spa",
      slug: "oasis-spa",
      tagline: "Relaxation, Swedish Massages & Rejuvenating Facials",
      category: "Day Spa & Wellness",
      city: "Miami, FL",
      phone: "(305) 555-0144",
      email: "hello@oasisspa.com",
      primaryColor: "#059669",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ...",
      keywords: "swedish massage, deep tissue massage, organic facial, relaxing atmosphere, professional therapists",
      targetTone: "calm, therapeutic, and peaceful",
      minGoogleStar: 4,
      subscriptionStatus: "SUSPENDED",
      planTier: "STARTER",
      billingCycle: "MONTHLY",
      planPrice: 49.0,
      currentPeriodEnd: fifteenDaysAgo,
      billingNotes: "Account suspended past grace period. Contact client.",
    },
  });

  const hashedSpaPassword = await bcrypt.hash("Spa123!", 10);
  await prisma.user.upsert({
    where: { email: "spa@oasisspa.com" },
    update: { businessId: spaBusiness.id },
    create: {
      email: "spa@oasisspa.com",
      name: "Elena Rostova",
      password: hashedSpaPassword,
      role: "BUSINESS_ADMIN",
      businessId: spaBusiness.id,
    },
  });

  console.log("Seeding complete! Subscriptions set: ACTIVE, DUE, and SUSPENDED accounts configured.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
