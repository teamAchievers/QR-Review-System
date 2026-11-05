import { useState, useEffect, useCallback } from 'react';
import { getPortalUrl } from '../config';
import { PRICING_PLANS, Plan } from '../data/mockData';

export interface DbPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  currency?: string;
  features: string;
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export function mapDbPlanToUiPlan(p: DbPlan): Plan {
  const isAnnualTotal = p.annualPrice > p.monthlyPrice;
  const effectiveAnnualMonthly = isAnnualTotal ? Math.round(p.annualPrice / 12) : p.annualPrice;
  const annualTotal = isAnnualTotal ? p.annualPrice : p.annualPrice * 12;

  const code = (p.code || '').toUpperCase();
  let standsIncluded = 1;
  let limits = '1 Location • Unlimited Scans';
  if (code === 'GROWTH') {
    standsIncluded = 3;
    limits = 'Up to 3 Locations • Unlimited Scans';
  } else if (code === 'PRO' || code === 'ENTERPRISE') {
    standsIncluded = 5;
    limits = 'Multi-Location Enterprise';
  }

  const featuresList = p.features
    ? p.features.split('\n').map((f) => f.trim()).filter(Boolean)
    : [];

  const currency = p.currency || 'INR';
  const currencySymbol = currency === 'USD' ? '$' : '₹';

  return {
    id: (p.code || p.id).toLowerCase(),
    tier: code || 'GROWTH',
    name: p.name,
    tagline: p.description || '',
    badge: p.isPopular ? 'MOST POPULAR • BEST ROI' : undefined,
    popular: Boolean(p.isPopular),
    monthlyPrice: p.monthlyPrice,
    annualPrice: effectiveAnnualMonthly,
    annualTotal,
    currency,
    currencySymbol,
    features: featuresList.length > 0 ? featuresList : ['Unlimited Customer Scans', 'Smart Review Routing'],
    standsIncluded,
    limits,
  };
}

export async function fetchAdminPlans(): Promise<Plan[]> {
  try {
    const portalUrl = getPortalUrl();
    const res = await fetch(`${portalUrl}/api/plans`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch plans: ${res.statusText}`);
    }

    const data = await res.json();
    if (data && Array.isArray(data.plans) && data.plans.length > 0) {
      return data.plans.map(mapDbPlanToUiPlan);
    }
  } catch (err) {
    console.warn('Could not load dynamic admin plans, falling back to local defaults:', err);
  }

  return PRICING_PLANS;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(PRICING_PLANS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await fetchAdminPlans();
      if (fetched && fetched.length > 0) {
        setPlans(fetched);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return { plans, loading, error, refreshPlans: loadPlans };
}
