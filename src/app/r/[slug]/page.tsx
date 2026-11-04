import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { evaluateSubscription } from "@/lib/subscription";
import ReviewFunnelClient from "./ReviewFunnelClient";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ReviewPage({ params }: Props) {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      category: true,
      city: true,
      primaryColor: true,
      minGoogleStar: true,
      googleReviewUrl: true,
      googlePlaceId: true,
      keywords: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      planPrice: true,
      planTier: true,
    },
  });

  if (!business) {
    notFound();
  }

  const subState = evaluateSubscription(business);

  return (
    <ReviewFunnelClient
      business={{
        ...business,
        isSuspended: subState.isSuspended,
      }}
    />
  );
}
