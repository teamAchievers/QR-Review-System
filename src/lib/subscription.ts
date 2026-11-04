export interface SubscriptionState {
  effectiveStatus: "ACTIVE" | "DUE" | "SUSPENDED";
  isSuspended: boolean;
  isPaymentPending: boolean;
  daysRemaining: number | null;
  daysOverdue: number | null;
  dueDate: string | null;
  planPrice: number;
  planTier: string;
  currency: string;
}

export function evaluateSubscription(business: {
  subscriptionStatus?: string | null;
  currentPeriodEnd?: Date | string | null;
  planPrice?: number | null;
  planTier?: string | null;
}): SubscriptionState {
  const currency = process.env.PAYMENT_CURRENCY || "INR";
  const planPrice = business.planPrice || 2999;
  const planTier = business.planTier || "GROWTH";

  // Manual hard suspension takes precedence
  if (business.subscriptionStatus === "SUSPENDED") {
    return {
      effectiveStatus: "SUSPENDED",
      isSuspended: true,
      isPaymentPending: false,
      daysRemaining: null,
      daysOverdue: null,
      dueDate: business.currentPeriodEnd ? new Date(business.currentPeriodEnd).toISOString() : null,
      planPrice,
      planTier,
      currency,
    };
  }

  if (!business.currentPeriodEnd) {
    return {
      effectiveStatus: (business.subscriptionStatus as any) || "ACTIVE",
      isSuspended: business.subscriptionStatus === "SUSPENDED",
      isPaymentPending: business.subscriptionStatus === "DUE",
      daysRemaining: null,
      daysOverdue: null,
      dueDate: null,
      planPrice,
      planTier,
      currency,
    };
  }

  const now = Date.now();
  const periodEnd = new Date(business.currentPeriodEnd).getTime();
  const diffDays = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));

  // Condition 1: Past Due Date -> Automatic Suspension / Disabled
  if (diffDays < 0) {
    return {
      effectiveStatus: "SUSPENDED",
      isSuspended: true,
      isPaymentPending: false,
      daysRemaining: 0,
      daysOverdue: Math.abs(diffDays),
      dueDate: new Date(business.currentPeriodEnd).toISOString(),
      planPrice,
      planTier,
      currency,
    };
  }

  // Condition 2: Pre-7 days before renewal -> Payment Pending notification active
  if (diffDays <= 7 || business.subscriptionStatus === "DUE") {
    return {
      effectiveStatus: "DUE",
      isSuspended: false,
      isPaymentPending: true,
      daysRemaining: diffDays,
      daysOverdue: null,
      dueDate: new Date(business.currentPeriodEnd).toISOString(),
      planPrice,
      planTier,
      currency,
    };
  }

  // Condition 3: Active and in good standing
  return {
    effectiveStatus: "ACTIVE",
    isSuspended: false,
    isPaymentPending: false,
    daysRemaining: diffDays,
    daysOverdue: null,
    dueDate: new Date(business.currentPeriodEnd).toISOString(),
    planPrice,
    planTier,
    currency,
  };
}
