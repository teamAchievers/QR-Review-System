import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import TagClaimClient from "./TagClaimClient";

interface Props {
  params: {
    tagCode: string;
  };
}

export default async function TagResolverPage({ params }: Props) {
  const cleanCode = (params.tagCode || "").toUpperCase().trim();

  const tag = await db.smartTag.findUnique({
    where: { tagCode: cleanCode },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          primaryColor: true,
        },
      },
    },
  });

  if (!tag) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 text-2xl font-black">
          ?
        </div>
        <h1 className="text-xl font-bold mb-2">Unrecognized Hardware Tag</h1>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          Tag code <code className="text-amber-400 font-mono font-bold">{cleanCode}</code> is not registered in the system.
          Please verify the serial code or contact support.
        </p>
        <a
          href="/"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
        >
          Return to Homepage
        </a>
      </div>
    );
  }

  // CASE 1: TAG IS ASSIGNED -> Seamlessly redirect to the business's review funnel!
  if (tag.status === "ASSIGNED" && tag.business) {
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || undefined;

    // Log the scan asynchronously
    try {
      await Promise.all([
        db.smartTag.update({
          where: { id: tag.id },
          data: {
            scanCount: { increment: 1 },
            lastScanned: new Date(),
          },
        }),
        db.scanLog.create({
          data: {
            businessId: tag.business.id,
            action: "QR_SCANNED",
            userAgent,
          },
        }),
      ]);
    } catch (e) {
      console.warn("Could not log tag scan:", e);
    }

    // Direct redirect to live review gating funnel
    redirect(`/r/${tag.business.slug}`);
  }

  // CASE 2: TAG IS UNASSIGNED (BLANK HARDWARE) -> Open Claiming & Configuration Studio!
  const session = await getSession();

  // If user is logged-in Super Admin or Business Admin, retrieve businesses for quick-linking
  let businesses: { id: string; name: string; slug: string; city: string | null; phone: string | null }[] = [];
  if (session) {
    if (session.role === "SUPER_ADMIN") {
      businesses = await db.business.findMany({
        select: { id: true, name: true, slug: true, city: true, phone: true },
        orderBy: { name: "asc" },
      });
    } else if (session.businessId) {
      const b = await db.business.findUnique({
        where: { id: session.businessId },
        select: { id: true, name: true, slug: true, city: true, phone: true },
      });
      if (b) businesses = [b];
    }
  }

  // Fetch active plans for customer / admin selection
  const rawPlans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { monthlyPrice: "asc" }],
  });

  const plans =
    rawPlans.length > 0
      ? rawPlans.map((p) => ({
          code: p.code,
          name: p.name,
          description: p.description,
          monthlyPrice: p.monthlyPrice,
          annualPrice: p.annualPrice,
          isPopular: p.isPopular,
        }))
      : [
          {
            code: "STARTER",
            name: "Starter Launch",
            description: "Ideal for single-counter local shops",
            monthlyPrice: 350,
            annualPrice: 3500,
            isPopular: false,
          },
          {
            code: "GROWTH",
            name: "Growth Pro",
            description: "Most popular for busy cafes & clinics",
            monthlyPrice: 800,
            annualPrice: 5000,
            isPopular: true,
          },
          {
            code: "PRO",
            name: "Enterprise Elite",
            description: "Multi-counter high-volume establishments",
            monthlyPrice: 1500,
            annualPrice: 12000,
            isPopular: false,
          },
        ];

  // Fetch payment config for Razorpay checkout
  const dbKeyId = await db.systemSetting.findUnique({ where: { key: "payment_key_id" } });
  const paymentKeyId =
    dbKeyId?.value?.trim() || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";

  const dbUpi = await db.systemSetting.findUnique({ where: { key: "payment_manual_upi_id" } });
  const manualUpiId = dbUpi?.value || "";

  return (
    <TagClaimClient
      tag={{
        id: tag.id,
        tagCode: tag.tagCode,
        batchCode: tag.batchCode,
        type: tag.type,
        status: tag.status,
        label: tag.label,
      }}
      session={session ? { id: session.id, email: session.email, name: session.name, role: session.role } : null}
      businesses={businesses}
      plans={plans}
      paymentKeyId={paymentKeyId}
      manualUpiId={manualUpiId}
    />
  );
}
