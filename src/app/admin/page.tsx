"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  QrCode,
  ShieldCheck,
  Plus,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Search,
  CheckCircle,
  X,
  Trash2,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Edit2,
  CreditCard,
  DollarSign,
  AlertTriangle,
  RotateCw,
  Package,
  Truck,
  MapPin,
  Tag,
  Percent,
  Megaphone,
  Calendar,
  Layers,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import { NICHE_CONFIGS } from "@/lib/niches";
import { convertFromInr, convertInrToUsd, convertUsdToInr, formatCurrency, CURRENCY_METADATA, isCurrencyStrongerThanInr } from "@/lib/currency";

interface BusinessWithUser {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  category: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  status: string;
  googleReviewUrl: string;
  googlePlaceId: string | null;
  tripadvisorReviewUrl?: string | null;
  reviewPlatform?: string | null;
  keywords: string;
  targetTone: string;
  minGoogleStar: number;
  poweredByText?: string | null;
  poweredByUrl?: string | null;
  // Subscription fields
  subscriptionStatus: string; // ACTIVE, DUE, SUSPENDED, TRIAL
  planTier: string; // STARTER, GROWTH, PRO, ENTERPRISE
  billingCycle: string; // MONTHLY, ANNUAL
  planPrice: number;
  currentPeriodEnd: string | null;
  lastPaymentDate: string | null;
  billingNotes: string | null;
  createdAt: string;
  users: { id: string; email: string; name: string }[];
  _count: {
    feedbacks: number;
    scanLogs: number;
  };
}

interface PlanItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface CouponItem {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

interface OfferItem {
  id: string;
  title: string;
  subtitle: string | null;
  badgeText: string | null;
  bannerColor: string;
  couponCode: string | null;
  targetAudience: string;
  ctaText: string;
  ctaLink: string | null;
  validUntil: string | null;
  isActive: boolean;
}

export default function MasterAdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    totalBusinesses: 0,
    totalScans: 0,
    totalLowFeedbacks: 0,
    totalHighRedirects: 0,
    activeSubscriptions: 0,
    dueSubscriptions: 0,
    suspendedSubscriptions: 0,
    trialSubscriptions: 0,
    totalMRR: 0,
  });
  const [businesses, setBusinesses] = useState<BusinessWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("ALL");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Standee Orders State
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [standeeOrders, setStandeeOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchStandeeOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders/standee");
      if (res.ok) {
        const data = await res.json();
        setStandeeOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      await fetch("/api/admin/orders/standee", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, trackingNumber }),
      });
      fetchStandeeOrders();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Navigation Tab State
  const [adminTab, setAdminTab] = useState<"BUSINESSES" | "PLANS" | "COUPONS" | "OFFERS" | "PAYMENTS">("BUSINESSES");

  // Payment Gateway Configuration State
  const [paymentConfig, setPaymentConfig] = useState({
    provider: "RAZORPAY",
    enabled: true,
    mode: "TEST",
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    currency: "INR",
    inrPerUsd: 85,
    usdMultiplier: 1.5,
    manualUpiId: "",
    manualBankDetails: "",
    gracePeriodDays: 7,
  });
  const [loadingPaymentConfig, setLoadingPaymentConfig] = useState(false);
  const [savingPaymentConfig, setSavingPaymentConfig] = useState(false);
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const fetchPaymentConfig = async () => {
    setLoadingPaymentConfig(true);
    try {
      const res = await fetch("/api/admin/payment-config");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setPaymentConfig(data.config);
        }
      }
    } catch (err) {
      console.error("Fetch payment config error:", err);
    } finally {
      setLoadingPaymentConfig(false);
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPaymentConfig(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/payment-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentConfig),
      });
      if (res.ok) {
        setSuccessMsg("Payment gateway configuration saved successfully!");
        fetchPaymentConfig();
      } else {
        alert("Failed to save payment configuration");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving payment configuration");
    } finally {
      setSavingPaymentConfig(false);
    }
  };

  const handleTestCredentials = async () => {
    if (!paymentConfig.keyId || !paymentConfig.keySecret) {
      alert("Please enter both Razorpay Key ID and Key Secret to test");
      return;
    }
    setTestingRazorpay(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/payment-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_CREDENTIALS",
          keyId: paymentConfig.keyId,
          keySecret: paymentConfig.keySecret,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || "Connection failed" });
      }
    } catch (err) {
      setTestResult({ success: false, message: "Network error testing Razorpay API" });
    } finally {
      setTestingRazorpay(false);
    }
  };

  // Plans Management State
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [plansPreviewCurrency, setPlansPreviewCurrency] = useState<"INR" | "USD">("INR");
  const [calcInrInput, setCalcInrInput] = useState<number>(1999);
  const [calcSelectedCurrency, setCalcSelectedCurrency] = useState<string>("USD");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [planForm, setPlanForm] = useState({
    code: "",
    name: "",
    description: "",
    monthlyPrice: 999,
    annualPrice: 9999,
    currency: "INR",
    features: "",
    isPopular: false,
    isActive: true,
    sortOrder: 0,
  });

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      code: "",
      name: "",
      description: "",
      monthlyPrice: 999,
      annualPrice: 9999,
      currency: "INR",
      features: "1 Branded Center-Logo QR Code\nUnlimited Customer Scans\nPrivate Negative Feedback Shield\nBasic Keyword Weaving",
      isPopular: false,
      isActive: true,
      sortOrder: plans.length + 1,
    });
    setPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: PlanItem) => {
    setEditingPlan(plan);
    setPlanForm({
      code: plan.code,
      name: plan.name,
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      currency: plan.currency,
      features: plan.features,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";
      const body = editingPlan ? { ...planForm, id: editingPlan.id } : planForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setPlanModalOpen(false);
        setSuccessMsg(editingPlan ? "Plan updated successfully!" : "Plan created successfully!");
        fetchPlans();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save plan");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving plan");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Plan deleted successfully");
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Coupons Management State
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 0,
    maxUses: 100 as number | null,
    validUntil: "",
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderValue: 0,
      maxUses: 100,
      validUntil: "",
      isActive: true,
    });
    setCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: CouponItem) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxUses: c.maxUses,
      validUntil: c.validUntil ? new Date(c.validUntil).toISOString().split("T")[0] : "",
      isActive: c.isActive,
    });
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";
      const body = editingCoupon ? { ...couponForm, id: editingCoupon.id } : couponForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setCouponModalOpen(false);
        setSuccessMsg(editingCoupon ? "Coupon updated successfully!" : "Coupon created successfully!");
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save coupon");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Coupon deleted");
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Offers Management State
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [offerForm, setOfferForm] = useState({
    title: "",
    subtitle: "",
    badgeText: "LIMITED TIME",
    bannerColor: "#2563eb",
    couponCode: "",
    targetAudience: "ALL",
    ctaText: "Claim Offer",
    ctaLink: "/dashboard?tab=billing",
    validUntil: "",
    isActive: true,
  });

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const res = await fetch("/api/admin/offers");
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleOpenCreateOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: "",
      subtitle: "",
      badgeText: "LIMITED TIME",
      bannerColor: "#2563eb",
      couponCode: "",
      targetAudience: "ALL",
      ctaText: "Claim Offer",
      ctaLink: "/dashboard?tab=billing",
      validUntil: "",
      isActive: true,
    });
    setOfferModalOpen(true);
  };

  const handleOpenEditOffer = (o: OfferItem) => {
    setEditingOffer(o);
    setOfferForm({
      title: o.title,
      subtitle: o.subtitle || "",
      badgeText: o.badgeText || "LIMITED TIME",
      bannerColor: o.bannerColor || "#2563eb",
      couponCode: o.couponCode || "",
      targetAudience: o.targetAudience,
      ctaText: o.ctaText,
      ctaLink: o.ctaLink || "/dashboard?tab=billing",
      validUntil: o.validUntil ? new Date(o.validUntil).toISOString().split("T")[0] : "",
      isActive: o.isActive,
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/offers";
      const method = editingOffer ? "PUT" : "POST";
      const body = editingOffer ? { ...offerForm, id: editingOffer.id } : offerForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOfferModalOpen(false);
        setSuccessMsg(editingOffer ? "Offer updated successfully!" : "Offer created successfully!");
        fetchOffers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save offer");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving offer");
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional offer?")) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Offer deleted");
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [showGoogleHelpEdit, setShowGoogleHelpEdit] = useState(false);
  const [showGoogleHelpCreate, setShowGoogleHelpCreate] = useState(false);
  const [showTripadvisorHelpEdit, setShowTripadvisorHelpEdit] = useState(false);
  const [showTripadvisorHelpCreate, setShowTripadvisorHelpCreate] = useState(false);
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [globalBranding, setGlobalBranding] = useState({
    poweredByText: "Unbox Studio",
    poweredByUrl: "https://unboxstudio.com",
    applyToAllBusinesses: false,
  });

  const fetchGlobalBranding = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setGlobalBranding((prev) => ({
            ...prev,
            poweredByText: data.settings.poweredByText || "Unbox Studio",
            poweredByUrl: data.settings.poweredByUrl || "https://unboxstudio.com",
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching global branding:", err);
    }
  };

  const handleSaveGlobalBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranding(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalBranding),
      });
      if (res.ok) {
        setSuccessMsg("Platform 'Powered by' branding updated successfully!");
        setBrandingModalOpen(false);
        fetchStats();
      } else {
        alert("Failed to update branding settings");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving branding settings");
    } finally {
      setSavingBranding(false);
    }
  };

  // Create Business Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Business & User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    category: "",
    city: "",
    phone: "",
    email: "",
    logoUrl: "",
    status: "ACTIVE",
    googleReviewUrl: "",
    googlePlaceId: "",
    tripadvisorReviewUrl: "",
    reviewPlatform: "GOOGLE",
    keywords: "",
    targetTone: "",
    minGoogleStar: 4,
    poweredByText: "Unbox Studio",
    poweredByUrl: "https://unboxstudio.com",
    // Subscription
    subscriptionStatus: "ACTIVE",
    planTier: "GROWTH",
    billingCycle: "MONTHLY",
    planPrice: 79,
    currentPeriodEnd: "",
    billingNotes: "",
    adminUserId: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    category: "",
    city: "",
    phone: "",
    email: "",
    logoUrl: "",
    googleReviewUrl: "",
    googlePlaceId: "",
    tripadvisorReviewUrl: "",
    reviewPlatform: "GOOGLE",
    keywords: "friendly staff, excellent service, high quality, highly recommended",
    targetTone: "enthusiastic and authentic",
    poweredByText: "Unbox Studio",
    poweredByUrl: "https://unboxstudio.com",
    subscriptionStatus: "ACTIVE",
    planTier: "GROWTH",
    billingCycle: "MONTHLY",
    planPrice: 79,
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 403 || res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.businesses) setBusinesses(data.businesses);
    } catch (err) {
      console.error(err);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
    fetchStandeeOrders();
    fetchPlans();
    fetchCoupons();
    fetchOffers();
    fetchGlobalBranding();
    fetchPaymentConfig();
  }, [fetchStats]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ? generatedSlug : prev.slug,
    }));
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create business");
      } else {
        setSuccessMsg(`Business "${data.business.name}" and Admin user created!`);
        setCreateModalOpen(false);
        setFormData({
          name: "",
          slug: "",
          tagline: "",
          category: "",
          city: "",
          phone: "",
          email: "",
          logoUrl: "",
          googleReviewUrl: "",
          googlePlaceId: "",
          tripadvisorReviewUrl: "",
          reviewPlatform: "GOOGLE",
          keywords: "friendly staff, excellent service, high quality, highly recommended",
          targetTone: "enthusiastic and authentic",
          poweredByText: "Unbox Studio",
          poweredByUrl: "https://unboxstudio.com",
          subscriptionStatus: "ACTIVE",
          planTier: "GROWTH",
          billingCycle: "MONTHLY",
          planPrice: 79,
          adminName: "",
          adminEmail: "",
          adminPassword: "",
        });
        fetchStats();
      }
    } catch {
      setErrorMsg("Error creating business");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal with prefilled data
  const handleOpenEdit = (b: BusinessWithUser) => {
    setEditingBusiness(b);
    const user = b.users[0];
    setEditFormData({
      name: b.name || "",
      slug: b.slug || "",
      tagline: b.tagline || "",
      category: b.category || "",
      city: b.city || "",
      phone: b.phone || "",
      email: b.email || "",
      logoUrl: b.logoUrl || "",
      status: b.status || "ACTIVE",
      googleReviewUrl: b.googleReviewUrl || "",
      googlePlaceId: b.googlePlaceId || "",
      tripadvisorReviewUrl: b.tripadvisorReviewUrl || "",
      reviewPlatform: b.reviewPlatform || "GOOGLE",
      keywords: b.keywords || "",
      targetTone: b.targetTone || "enthusiastic and authentic",
      minGoogleStar: b.minGoogleStar || 4,
      poweredByText: b.poweredByText || "Unbox Studio",
      poweredByUrl: b.poweredByUrl || "https://unboxstudio.com",
      // Subscription
      subscriptionStatus: b.subscriptionStatus || "ACTIVE",
      planTier: b.planTier || "GROWTH",
      billingCycle: b.billingCycle || "MONTHLY",
      planPrice: b.planPrice || 79,
      currentPeriodEnd: b.currentPeriodEnd ? new Date(b.currentPeriodEnd).toISOString().split("T")[0] : "",
      billingNotes: b.billingNotes || "",
      adminUserId: user ? user.id : "",
      adminName: user ? user.name : "",
      adminEmail: user ? user.email : "",
      adminPassword: "", // Leave blank unless changing
    });
    setErrorMsg(null);
    setEditModalOpen(true);
  };

  // Submit Edit form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/businesses/${editingBusiness.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update business profile");
      } else {
        setSuccessMsg(`Business "${data.business.name}" updated successfully!`);
        setEditModalOpen(false);
        setEditingBusiness(null);
        fetchStats();
      }
    } catch {
      setErrorMsg("Error updating business profile");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick 1-click subscription status change
  const handleQuickStatusChange = async (businessId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: newStatus }),
      });
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick 1-click renewal (+30 days)
  const handleQuickRenew = async (businessId: string, businessName: string) => {
    if (!confirm(`Mark payment received and renew "${businessName}" for another billing period?`)) {
      return;
    }
    try {
      await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ renewSubscription: true }),
      });
      setSuccessMsg(`Subscription renewed successfully for "${businessName}"!`);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDeleteBusiness = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all associated feedback and QR data.`)) {
      return;
    }
    try {
      await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      subscriptionFilter === "ALL" || b.subscriptionStatus === subscriptionFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white">SmartReview SaaS</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400">Subscription Lifecycle &amp; Tenant Provisioning</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchStandeeOrders();
              setOrdersModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Standee Orders</span>
            {standeeOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {standeeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              fetchGlobalBranding();
              setBrandingModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Edit default 'Powered by' white-label footer and links across the platform"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>&quot;Powered by&quot; Branding</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Business &amp; User</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 text-xs transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Module Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: "BUSINESSES", label: "Businesses & QR Profiles", icon: Building2, count: businesses.length },
              { id: "PLANS", label: "Plans & Pricing", icon: Layers, count: plans.length },
              { id: "COUPONS", label: "Coupon Codes", icon: Tag, count: coupons.length },
              { id: "OFFERS", label: "Promotions & Offers", icon: Sparkles, count: offers.length },
              { id: "PAYMENTS", label: "Payment Gateway", icon: CreditCard, count: paymentConfig.enabled ? (paymentConfig.mode === "LIVE" ? "LIVE" : "TEST") : "OFF" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Action according to active tab */}
          <div>
            {adminTab === "PLANS" && (
              <button
                onClick={handleOpenCreatePlan}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Plan</span>
              </button>
            )}
            {adminTab === "COUPONS" && (
              <button
                onClick={handleOpenCreateCoupon}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Coupon</span>
              </button>
            )}
            {adminTab === "OFFERS" && (
              <button
                onClick={handleOpenCreateOffer}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Offer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)}>
              <X className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}

        {/* Subscription & MRR KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Monthly Recurring Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">${metrics.totalMRR} <span className="text-xs text-slate-400 font-normal">/mo</span></div>
            <p className="text-[11px] text-slate-400 mt-1">Across all active &amp; due tenants</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Subscriptions</span>
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{metrics.activeSubscriptions}</div>
            <p className="text-[11px] text-slate-400 mt-1">Paid &amp; fully operational</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Renewals Due</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{metrics.dueSubscriptions}</div>
            <p className="text-[11px] text-slate-400 mt-1">Payment pending / grace period</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Suspended Accounts</span>
              <CreditCard className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400">{metrics.suspendedSubscriptions}</div>
            <p className="text-[11px] text-slate-400 mt-1">QR funnel locked (non-payment)</p>
          </div>
        </div>

        {/* Business Directory & Subscription Filtering */}
        {adminTab === "BUSINESSES" && (
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Client Subscriptions &amp; QR Profiles</h2>
              <p className="text-xs text-slate-400">Manage client tiers, renewals, suspension status, and credentials</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={fetchStats}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subscription Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-700 pb-4">
            <span className="text-xs text-slate-400 font-semibold mr-2">Filter by Status:</span>
            {[
              { label: "All Businesses", value: "ALL", count: businesses.length },
              { label: "Active", value: "ACTIVE", count: metrics.activeSubscriptions },
              { label: "Due / Pending", value: "DUE", count: metrics.dueSubscriptions },
              { label: "Suspended", value: "SUSPENDED", count: metrics.suspendedSubscriptions },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSubscriptionFilter(tab.value)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  subscriptionFilter === tab.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800/80 text-slate-300">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Business Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3 px-3">Business</th>
                  <th className="pb-3 px-3">Plan &amp; Price</th>
                  <th className="pb-3 px-3">Subscription Status</th>
                  <th className="pb-3 px-3">Renewal / Due</th>
                  <th className="pb-3 px-3">Assigned User</th>
                  <th className="pb-3 px-3">Funnel Link</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredBusinesses.map((b) => {
                  const adminUser = b.users[0];
                  return (
                    <tr key={b.id} className="hover:bg-slate-750/30 transition-colors">
                      <td className="py-4 px-3">
                        <div className="font-bold text-white text-sm">{b.name}</div>
                        <div className="text-[11px] text-slate-400">/{b.slug}</div>
                      </td>
                      <td className="py-4 px-3 text-slate-300">
                        <div className="font-semibold text-white">{b.planTier || "GROWTH"}</div>
                        <div className="text-[11px] text-emerald-400 font-medium">
                          ${b.planPrice || 49} / {b.billingCycle === "ANNUAL" ? "yr" : "mo"}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        {/* Interactive Status Selector */}
                        <select
                          value={b.subscriptionStatus || "ACTIVE"}
                          onChange={(e) => handleQuickStatusChange(b.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            b.subscriptionStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : b.subscriptionStatus === "DUE"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          <option value="ACTIVE" className="bg-slate-800 text-emerald-400">ACTIVE</option>
                          <option value="DUE" className="bg-slate-800 text-amber-400">DUE (Renewal)</option>
                          <option value="SUSPENDED" className="bg-slate-800 text-rose-400">SUSPENDED</option>
                        </select>
                      </td>
                      <td className="py-4 px-3">
                        {b.currentPeriodEnd ? (
                          <div className={b.subscriptionStatus === "DUE" ? "text-amber-400 font-semibold" : "text-slate-300"}>
                            {new Date(b.currentPeriodEnd).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                        {b.subscriptionStatus === "DUE" && (
                          <button
                            onClick={() => handleQuickRenew(b.id, b.name)}
                            className="mt-1 text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                          >
                            <RotateCw className="w-3 h-3" /> Renew +30d
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {adminUser ? (
                          <div>
                            <div className="font-medium text-slate-200">{adminUser.name}</div>
                            <div className="text-[11px] text-slate-400">{adminUser.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No admin user</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyLink(b.slug)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-1 text-[11px]"
                            title="Copy customer QR review URL"
                          >
                            {copiedSlug === b.slug ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={`/r/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-400"
                            title="Test QR Customer Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="Edit Profile & Subscription"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <a
                            href={`/api/qr?slug=${b.slug}&format=svg`}
                            download={`qr-${b.slug}.svg`}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-[11px]"
                            title="Download SVG QR"
                          >
                            QR
                          </a>
                          <button
                            onClick={() => handleDeleteBusiness(b.id, b.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete business"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* ================= PLANS TAB ================= */}
        {adminTab === "PLANS" && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>Subscription Plans &amp; Tiers</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Configure dynamic pricing tiers, monthly/annual fees, and feature sets for client onboarding.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-semibold px-2">Currency:</span>
                  <button
                    type="button"
                    onClick={() => setPlansPreviewCurrency("INR")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      plansPreviewCurrency === "INR"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlansPreviewCurrency("USD")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      plansPreviewCurrency === "USD"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    $ USD (1.5x)
                  </button>
                </div>
                <button
                  onClick={handleOpenCreatePlan}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Plan</span>
                </button>
              </div>
            </div>

            {loadingPlans ? (
              <div className="p-12 text-center text-slate-400">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-12 text-center text-slate-400">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">No plans configured yet</h3>
                <p className="text-xs text-slate-500 mb-4">Click &quot;Add New Plan&quot; to create your first pricing tier.</p>
                <button
                  onClick={handleOpenCreatePlan}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                >
                  Create Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => {
                  const featureList = p.features
                    ? p.features.split("\n").filter((f) => f.trim())
                    : [];
                  return (
                    <div
                      key={p.id}
                      className={`bg-slate-800/90 border rounded-3xl p-6 relative flex flex-col justify-between transition-all ${
                        p.isPopular
                          ? "border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                          : "border-slate-700/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                            {p.code}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {p.isPopular && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                POPULAR
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {p.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                        {p.description && (
                          <p className="text-xs text-slate-400 mb-4">{p.description}</p>
                        )}

                        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 mb-5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">
                              {plansPreviewCurrency === "USD"
                                ? formatCurrency(convertInrToUsd(p.monthlyPrice, paymentConfig.inrPerUsd, paymentConfig.usdMultiplier), "USD")
                                : formatCurrency(p.monthlyPrice, "INR")}
                            </span>
                            <span className="text-xs text-slate-400">/ month</span>
                            {plansPreviewCurrency === "USD" && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                (Base: ₹{p.monthlyPrice})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center justify-between">
                            <span>
                              Annual:{" "}
                              {plansPreviewCurrency === "USD"
                                ? formatCurrency(convertInrToUsd(p.annualPrice, paymentConfig.inrPerUsd, paymentConfig.usdMultiplier), "USD")
                                : formatCurrency(p.annualPrice, "INR")} / yr
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                              Save ~17%
                            </span>
                          </div>
                        </div>

                        {featureList.length > 0 && (
                          <div className="space-y-2 mb-6">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Included Features:
                            </div>
                            <ul className="space-y-2">
                              {featureList.map((f, idx) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-700 flex items-center justify-between gap-2 mt-4">
                        <button
                          onClick={() => handleOpenEditPlan(p)}
                          className="flex-1 py-2 bg-slate-700/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Plan</span>
                        </button>
                        <button
                          onClick={() => handleDeletePlan(p.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= COUPONS TAB ================= */}
        {adminTab === "COUPONS" && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <span>Coupon &amp; Promo Codes</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Generate discount voucher codes with percentage or flat deductions, usage caps, and expirations.
                </p>
              </div>
              <button
                onClick={handleOpenCreateCoupon}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon Code</span>
              </button>
            </div>

            {loadingCoupons ? (
              <div className="p-12 text-center text-slate-400">Loading coupon codes...</div>
            ) : coupons.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-12 text-center text-slate-400">
                <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">No coupons created yet</h3>
                <p className="text-xs text-slate-500 mb-4">Click &quot;Create Coupon Code&quot; to offer special discounts to clients.</p>
                <button
                  onClick={handleOpenCreateCoupon}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                >
                  Create Coupon
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="pb-3 px-3">Coupon Code</th>
                      <th className="pb-3 px-3">Discount</th>
                      <th className="pb-3 px-3">Description</th>
                      <th className="pb-3 px-3">Min Order</th>
                      <th className="pb-3 px-3">Usage</th>
                      <th className="pb-3 px-3">Valid Until</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-750/30 transition-colors">
                        <td className="py-4 px-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(c.code);
                              setCopiedSlug(c.code);
                              setTimeout(() => setCopiedSlug(null), 1500);
                            }}
                            className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 flex items-center gap-1.5 transition-colors"
                            title="Click to copy code"
                          >
                            <span>{c.code}</span>
                            {copiedSlug === c.code ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-amber-400/70" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-3 font-bold text-emerald-400">
                          {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                        </td>
                        <td className="py-4 px-3 text-slate-300 max-w-xs truncate">
                          {c.description || "-"}
                        </td>
                        <td className="py-4 px-3 text-slate-300">
                          {c.minOrderValue > 0 ? `₹${c.minOrderValue}` : "No min."}
                        </td>
                        <td className="py-4 px-3 text-slate-300">
                          <span className="font-semibold text-white">{c.usedCount}</span>
                          <span className="text-slate-500"> / {c.maxUses ? c.maxUses : "∞"}</span>
                        </td>
                        <td className="py-4 px-3 text-slate-300">
                          {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : <span className="text-slate-500">Never</span>}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {c.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCoupon(c)}
                              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= PROMOTIONAL OFFERS TAB ================= */}
        {adminTab === "OFFERS" && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-400" />
                  <span>Promotional Offers &amp; Announcements</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Broadcast interactive banner alerts, seasonal discounts, and upgrade incentives across client dashboards.
                </p>
              </div>
              <button
                onClick={handleOpenCreateOffer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Offer</span>
              </button>
            </div>

            {loadingOffers ? (
              <div className="p-12 text-center text-slate-400">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-12 text-center text-slate-400">
                <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">No offers generated yet</h3>
                <p className="text-xs text-slate-500 mb-4">Click &quot;Generate Offer&quot; to publish a promotional banner to clients.</p>
                <button
                  onClick={handleOpenCreateOffer}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                >
                  Generate Offer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((o) => (
                  <div
                    key={o.id}
                    className="bg-slate-800/90 border border-slate-700/70 rounded-3xl p-6 shadow-sm space-y-4"
                  >
                    {/* Live Banner Preview */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Live Client Banner Preview:</span>
                      </div>
                      <div
                        className="p-4 sm:p-5 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                        style={{ backgroundColor: o.bannerColor || "#2563eb" }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {o.badgeText && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/30 backdrop-blur text-white border border-white/20">
                                {o.badgeText}
                              </span>
                            )}
                            {o.couponCode && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />
                                {o.couponCode}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold drop-shadow-xs">{o.title}</h4>
                          {o.subtitle && (
                            <p className="text-xs text-white/90 drop-shadow-xs">{o.subtitle}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                          <button
                            type="button"
                            className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition-colors"
                          >
                            {o.ctaText}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/60 text-xs">
                      <div className="flex flex-wrap items-center gap-3 text-slate-300">
                        <div>
                          <strong>Audience:</strong>{" "}
                          <span className="text-blue-300 font-medium">{o.targetAudience}</span>
                        </div>
                        <div>
                          <strong>Expires:</strong>{" "}
                          <span className="text-slate-400">
                            {o.validUntil ? new Date(o.validUntil).toLocaleDateString() : "No Expiration"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {o.isActive ? "ACTIVE & LIVE" : "INACTIVE / PAUSED"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditOffer(o)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Offer</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(o.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                          title="Delete offer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= PAYMENT GATEWAY CONFIGURATION TAB ================= */}
        {adminTab === "PAYMENTS" && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>Payment Gateway &amp; Billing Configuration</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage Razorpay API credentials, environment modes (Test / Live), webhook security, and renewal notice policies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  paymentConfig.enabled
                    ? paymentConfig.mode === "LIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}>
                  {paymentConfig.enabled ? `${paymentConfig.mode} MODE ACTIVE` : "GATEWAY DISABLED"}
                </span>
              </div>
            </div>

            {testResult && (
              <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <span>{testResult.message}</span>
                </div>
                <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSavePaymentConfig} className="space-y-6">
              {/* 1. Gateway Status & Environment Mode */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>1. Gateway Status &amp; Environment</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Payment Gateway Provider
                    </label>
                    <select
                      value={paymentConfig.provider}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, provider: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="RAZORPAY">Razorpay (India &amp; Global UPI / Cards)</option>
                      <option value="MANUAL">Manual Offline / Direct UPI Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Environment / Mode
                    </label>
                    <select
                      value={paymentConfig.mode}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, mode: e.target.value })}
                      className={`w-full text-xs p-2.5 bg-slate-900 border rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        paymentConfig.mode === "LIVE" ? "text-emerald-400 border-emerald-500/50" : "text-amber-400 border-amber-500/50"
                      }`}
                    >
                      <option value="TEST">TEST / SANDBOX (Demo Payments)</option>
                      <option value="LIVE">LIVE / PRODUCTION (Real Money)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Settlement Currency
                    </label>
                    <select
                      value={paymentConfig.currency}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, currency: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={paymentConfig.enabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, enabled: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                    />
                    <span>
                      <strong>Enable Online Payment Gateway</strong> (allows client businesses to pay subscriptions and buy standees online)
                    </span>
                  </label>
                </div>
              </div>

              {/* 2. Razorpay API Credentials */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>2. Razorpay API Keys</span>
                  </h3>
                  <a
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Razorpay Dashboard API Keys</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Razorpay Key ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_test_... or rzp_live_..."
                      value={paymentConfig.keyId}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, keyId: e.target.value.trim() })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Starts with <code className="text-slate-400">rzp_test_</code> for sandbox or <code className="text-slate-400">rzp_live_</code> for production.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Razorpay Key Secret <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showSecretKey ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <input
                      type={showSecretKey ? "text" : "password"}
                      placeholder="Enter Razorpay Secret Key"
                      value={paymentConfig.keySecret}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, keySecret: e.target.value.trim() })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Used by backend API to generate orders and verify HMAC signatures.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Webhook Secret (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Razorpay Webhook Secret for callback validation"
                    value={paymentConfig.webhookSecret}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, webhookSecret: e.target.value.trim() })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-750">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Verify Credentials:</span> Test connection to Razorpay API with the entered keys before saving.
                  </div>
                  <button
                    type="button"
                    onClick={handleTestCredentials}
                    disabled={testingRazorpay}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto shrink-0"
                  >
                    {testingRazorpay ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Test API Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. IP-Based Geolocation & Dynamic Currency Engine (Stronger > INR vs Weaker < INR) */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>3. IP-Based Currency &amp; 1.5x Multiplier Logic</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      🌍 IP Location Auto-Detect: ACTIVE
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Stronger: {paymentConfig.usdMultiplier}x | Weaker: 1.0x
                    </span>
                  </div>
                </div>

                {/* Explanation of the exact Business Rules */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-750 space-y-2.5 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Automatic Currency &amp; Multiplier Rules:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Currencies Stronger than INR (&gt; 1 INR):</span>
                      </div>
                      <p className="text-slate-300">
                        When currency value is greater than INR (e.g. <strong>USD ($85)</strong>, <strong>EUR (€92)</strong>, <strong>GBP (£110)</strong>, <strong>CAD (CA$62)</strong>), the system <strong>multiplies the converted value by {paymentConfig.usdMultiplier}x</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                      <div className="font-bold text-blue-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Currencies Weaker than INR (&lt; 1 INR):</span>
                      </div>
                      <p className="text-slate-300">
                        When currency is weaker than INR (e.g. <strong>JPY (¥0.56)</strong>, <strong>IDR (Rp 0.005)</strong>, <strong>KRW (₩0.06)</strong>, <strong>VND (₫0.003)</strong>), the system converts at exact exchange rate with <strong>NO multiplier (1.0x)</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Base Exchange Rate for USD (INR per 1 USD)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">1 USD =</span>
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={paymentConfig.inrPerUsd}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, inrPerUsd: Number(e.target.value) })}
                        className="w-28 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-400">₹ INR</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Stronger Currency Markup Multiplier
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0.1}
                        step="0.1"
                        value={paymentConfig.usdMultiplier}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, usdMultiplier: Number(e.target.value) })}
                        className="w-28 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-400">multiplier (Default: 1.5x)</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Currency Demonstration Grid */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-750 text-xs space-y-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Live Rates Comparison for Growth Plan (₹1,999 base):
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-emerald-500/30">
                      <div className="text-[10px] text-emerald-400 font-bold">USD ($) • Stronger</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Rate: 85 | Multiplier: {paymentConfig.usdMultiplier}x</div>
                      <div className="text-white font-bold text-xs mt-1">
                        ${convertFromInr(1999, "USD", paymentConfig.usdMultiplier, paymentConfig.inrPerUsd).convertedAmount} USD
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-emerald-500/30">
                      <div className="text-[10px] text-emerald-400 font-bold">EUR (€) • Stronger</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Rate: 92 | Multiplier: {paymentConfig.usdMultiplier}x</div>
                      <div className="text-white font-bold text-xs mt-1">
                        €{convertFromInr(1999, "EUR", paymentConfig.usdMultiplier).convertedAmount} EUR
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-blue-500/30">
                      <div className="text-[10px] text-blue-400 font-bold">JPY (¥) • Weaker</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Rate: 0.56 | Multiplier: 1.0x</div>
                      <div className="text-white font-bold text-xs mt-1">
                        ¥{convertFromInr(1999, "JPY", paymentConfig.usdMultiplier).convertedAmount.toLocaleString()} JPY
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-blue-500/30">
                      <div className="text-[10px] text-blue-400 font-bold">IDR (Rp) • Weaker</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Rate: 0.0053 | Multiplier: 1.0x</div>
                      <div className="text-white font-bold text-xs mt-1">
                        Rp {convertFromInr(1999, "IDR", paymentConfig.usdMultiplier).convertedAmount.toLocaleString()} IDR
                      </div>
                    </div>
                  </div>

                  {/* Interactive Test Calculator */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-slate-400 text-[11px] font-semibold">Test Any Currency &amp; Multiplier:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-400 font-mono text-xs">₹</span>
                      <input
                        type="number"
                        value={calcInrInput}
                        onChange={(e) => setCalcInrInput(Number(e.target.value))}
                        className="w-24 text-xs p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        placeholder="INR"
                      />
                      <span className="text-slate-400 text-xs">convert to</span>
                      <select
                        value={calcSelectedCurrency}
                        onChange={(e) => setCalcSelectedCurrency(e.target.value)}
                        className="text-xs p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                      >
                        {Object.keys(CURRENCY_METADATA).filter(c => c !== "INR").map((c) => (
                          <option key={c} value={c}>
                            {c} ({isCurrencyStrongerThanInr(c) ? "Stronger > 1.5x" : "Weaker - 1.0x"})
                          </option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-xs">→</span>
                      {(() => {
                        const res = convertFromInr(
                          calcInrInput,
                          calcSelectedCurrency,
                          paymentConfig.usdMultiplier,
                          calcSelectedCurrency === "USD" ? paymentConfig.inrPerUsd : undefined
                        );
                        return (
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${
                            res.isStronger
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          }`}>
                            {res.formatted} ({res.multiplier}x)
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Dunning & Renewal Policy Rules */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-emerald-400" />
                  <span>4. Renewal Notification &amp; Suspension Rules</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Payment Pending Notification Trigger (Days Prior to Due Date)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={paymentConfig.gracePeriodDays}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, gracePeriodDays: Number(e.target.value) })}
                        className="w-24 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-400">days before expiration (Default: 7 days)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Shows warning banner &amp; payment button in client dashboard starting 7 days prior to renewal.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Suspension Policy After Due Date
                    </label>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 text-xs text-slate-400 space-y-1">
                      <div className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Automatic Access Lockdown</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        When subscription expires, client QR code and URL are paused, dashboard is greyed out, and only renewal payment popup is accessible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Manual Offline UPI / Bank Payment Fallback */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span>5. Direct UPI &amp; Offline Payment Fallback (Optional)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Direct UPI VPA / ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. unboxstudio@icici or 9876543210@upi"
                      value={paymentConfig.manualUpiId}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, manualUpiId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Displayed on manual payment invoices or when online gateway is paused.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bank Transfer Details (NEFT/IMPS)
                    </label>
                    <input
                      type="text"
                      placeholder="A/C No: 1234567890, IFSC: HDFC0001234, Name: Unbox Studio"
                      value={paymentConfig.manualBankDetails}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, manualBankDetails: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingPaymentConfig}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  {savingPaymentConfig ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Payment Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ================= EDIT BUSINESS & SUBSCRIPTION MODAL ================= */}
      {editModalOpen && editingBusiness && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  <span>Edit Profile &amp; Subscription</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manage subscription billing, active/due/suspended lifecycle, and user credentials
                </p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* 1. Subscription Lifecycle Section */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Subscription &amp; Billing Lifecycle</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const cycleDays = editFormData.billingCycle === "ANNUAL" ? 365 : 30;
                      const nextDate = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                      setEditFormData({
                        ...editFormData,
                        subscriptionStatus: "ACTIVE",
                        currentPeriodEnd: nextDate,
                      });
                    }}
                    className="text-[11px] px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Mark Paid &amp; Renew +30 Days</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Status</label>
                    <select
                      value={editFormData.subscriptionStatus}
                      onChange={(e) => setEditFormData({ ...editFormData, subscriptionStatus: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">ACTIVE (Paid &amp; Live)</option>
                      <option value="DUE">DUE (Payment Pending)</option>
                      <option value="SUSPENDED">SUSPENDED (Locked)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Tier</label>
                    <select
                      value={editFormData.planTier}
                      onChange={(e) => setEditFormData({ ...editFormData, planTier: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="STARTER">STARTER ($49/mo)</option>
                      <option value="GROWTH">GROWTH ($79/mo)</option>
                      <option value="PRO">PRO ($149/mo)</option>
                      <option value="ENTERPRISE">ENTERPRISE ($299/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Price ($)</label>
                    <input
                      type="number"
                      value={editFormData.planPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, planPrice: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Next Renewal / Due Date</label>
                    <input
                      type="date"
                      value={editFormData.currentPeriodEnd}
                      onChange={(e) => setEditFormData({ ...editFormData, currentPeriodEnd: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Notes / Method</label>
                    <input
                      type="text"
                      placeholder="e.g. Paid via Stripe, invoice sent, etc."
                      value={editFormData.billingNotes}
                      onChange={(e) => setEditFormData({ ...editFormData, billingNotes: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Business Details */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                  2. Business Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug (/r/...)</label>
                    <input
                      type="text"
                      required
                      value={editFormData.slug}
                      onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Niche</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const matched = NICHE_CONFIGS.find((n) => n.id === newCat || n.name === newCat);
                        setEditFormData({
                          ...editFormData,
                          category: newCat,
                          keywords: !editFormData.keywords && matched ? matched.defaultKeywords : editFormData.keywords,
                        });
                      }}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Industry Niche --</option>
                      {NICHE_CONFIGS.map((n) => (
                        <option key={n.id} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City &amp; State</label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Center QR Logo URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={editFormData.logoUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, logoUrl: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Google Reviews & SEO Keywords */}
              <div className="pt-2 border-t border-slate-700/60">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                  3. Google Reviews &amp; SEO Keywords
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">Google Review Direct Link (URL)</label>
                      <button
                        type="button"
                        onClick={() => setShowGoogleHelpEdit(!showGoogleHelpEdit)}
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{showGoogleHelpEdit ? "Hide instructions" : "How to get this link?"}</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editFormData.googleReviewUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, googleReviewUrl: e.target.value })}
                        placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                        className="flex-1 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      {editFormData.googleReviewUrl && (
                        <a
                          href={editFormData.googleReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-600/30 flex items-center gap-1 shrink-0"
                          title="Open review dialog in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Test</span>
                        </a>
                      )}
                    </div>

                    {showGoogleHelpEdit && (
                      <div className="mt-2.5 p-3.5 bg-slate-900/90 border border-blue-500/30 rounded-xl text-xs text-slate-300 space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold text-blue-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>How to get Google Review Direct Short Link:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                          <li>Search the business name on Google Maps or Google Search.</li>
                          <li>Ensure you are logged into the account managing the Google Business Profile.</li>
                          <li>Click the <strong>&quot;Ask for reviews&quot;</strong> button in the manager view.</li>
                          <li>Copy the direct short link (e.g. <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded">https://g.page/r/.../review</code>) and paste it here!</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00aa6c]"></span>
                        <span>Review Platform Target</span>
                      </label>
                      <select
                        value={editFormData.reviewPlatform}
                        onChange={(e) => setEditFormData({ ...editFormData, reviewPlatform: e.target.value })}
                        className="text-xs p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="GOOGLE">Google Reviews Only</option>
                        <option value="TRIPADVISOR">TripAdvisor Only</option>
                        <option value="BOTH">Both (Customer Chooses)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">TripAdvisor Direct Review Link (URL)</label>
                        <button
                          type="button"
                          onClick={() => setShowTripadvisorHelpEdit(!showTripadvisorHelpEdit)}
                          className="text-[11px] font-semibold text-[#00aa6c] hover:underline flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{showTripadvisorHelpEdit ? "Hide" : "How to get this link?"}</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editFormData.tripadvisorReviewUrl}
                          onChange={(e) => setEditFormData({ ...editFormData, tripadvisorReviewUrl: e.target.value })}
                          placeholder="https://www.tripadvisor.com/UserReviewEdit-g... or listing URL"
                          className="flex-1 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00aa6c] font-mono"
                        />
                        {editFormData.tripadvisorReviewUrl && (
                          <a
                            href={editFormData.tripadvisorReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-[#00aa6c]/20 text-[#00aa6c] border border-[#00aa6c]/30 rounded-xl text-xs font-semibold hover:bg-[#00aa6c]/30 flex items-center gap-1 shrink-0"
                            title="Test TripAdvisor link"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Test</span>
                          </a>
                        )}
                      </div>

                      {showTripadvisorHelpEdit && (
                        <div className="mt-2 p-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-xs text-slate-300 space-y-1 text-[11px]">
                          <p className="font-bold text-emerald-400">Official TripAdvisor URL format:</p>
                          <p>Go to your business page on TripAdvisor, click "Write a review", and paste the resulting URL (e.g. <code>https://www.tripadvisor.com/UserReviewEdit-g...</code>).</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target SEO Keywords</label>
                    <textarea
                      rows={2}
                      value={editFormData.keywords}
                      onChange={(e) => setEditFormData({ ...editFormData, keywords: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Agency White-Label Branding */}
              <div className="pt-2 border-t border-slate-700/60">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>4. Agency &amp; White-Label &quot;Powered by&quot; Branding</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      &quot;Powered by&quot; Text Label
                    </label>
                    <input
                      type="text"
                      placeholder="Unbox Studio"
                      value={editFormData.poweredByText}
                      onChange={(e) => setEditFormData({ ...editFormData, poweredByText: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      &quot;Powered by&quot; Destination URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://unboxstudio.com"
                      value={editFormData.poweredByUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, poweredByUrl: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs text-slate-400">
                  <span>Client Footer Preview:</span>
                  <div className="text-slate-300">
                    Powered by <strong className="text-white">{editFormData.poweredByText || "Unbox Studio"}</strong>
                  </div>
                </div>
              </div>

              {/* 5. Client Admin User */}
              <div className="pt-2 border-t border-slate-700/60">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                  4. Client Login &amp; Password
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editFormData.adminName}
                      onChange={(e) => setEditFormData({ ...editFormData, adminName: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Login Email</label>
                    <input
                      type="email"
                      required
                      value={editFormData.adminEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, adminEmail: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Reset Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep"
                      value={editFormData.adminPassword}
                      onChange={(e) => setEditFormData({ ...editFormData, adminPassword: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CREATE BUSINESS MODAL ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Business &amp; Subscription</h3>
                <p className="text-xs text-slate-400">Add a client business, assign plan tier, and create login</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateBusiness} className="space-y-5">
              {/* Subscription Initial Plan */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                  Subscription &amp; Pricing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Tier</label>
                    <select
                      value={formData.planTier}
                      onChange={(e) => {
                        const tier = e.target.value;
                        const prices: Record<string, number> = { STARTER: 49, GROWTH: 79, PRO: 149, ENTERPRISE: 299 };
                        setFormData({ ...formData, planTier: tier, planPrice: prices[tier] || 79 });
                      }}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="STARTER">STARTER ($49/mo)</option>
                      <option value="GROWTH">GROWTH ($79/mo)</option>
                      <option value="PRO">PRO ($149/mo)</option>
                      <option value="ENTERPRISE">ENTERPRISE ($299/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                    <select
                      value={formData.subscriptionStatus}
                      onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">ACTIVE (Paid)</option>
                      <option value="DUE">DUE (Invoice Pending)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Price ($)</label>
                    <input
                      type="number"
                      value={formData.planPrice}
                      onChange={(e) => setFormData({ ...formData, planPrice: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                  Business Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Dental Clinic"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      URL Slug <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="text-[11px] text-slate-500 mr-1">/r/</span>
                      <input
                        type="text"
                        required
                        placeholder="apex-dental"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                        className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Niche</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const matched = NICHE_CONFIGS.find((n) => n.id === newCat || n.name === newCat);
                        setFormData({
                          ...formData,
                          category: newCat,
                          keywords: matched ? matched.defaultKeywords : formData.keywords,
                        });
                      }}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Industry Niche --</option>
                      {NICHE_CONFIGS.map((n) => (
                        <option key={n.id} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City &amp; State</label>
                    <input
                      type="text"
                      placeholder="e.g. Seattle, WA"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Google Reviews & Agency Branding */}
              <div className="pt-2 border-t border-slate-700/60">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                  Google Review Link &amp; Agency Branding
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">Google Review Direct Link (URL)</label>
                      <button
                        type="button"
                        onClick={() => setShowGoogleHelpCreate(!showGoogleHelpCreate)}
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{showGoogleHelpCreate ? "Hide instructions" : "How to get this link?"}</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.googleReviewUrl}
                        onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                        placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                        className="flex-1 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      {formData.googleReviewUrl && (
                        <a
                          href={formData.googleReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-600/30 flex items-center gap-1 shrink-0"
                          title="Test Google review link"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Test</span>
                        </a>
                      )}
                    </div>

                    {showGoogleHelpCreate && (
                      <div className="mt-2.5 p-3.5 bg-slate-900/90 border border-blue-500/30 rounded-xl text-xs text-slate-300 space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold text-blue-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>How to get Google Review Direct Short Link:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                          <li>Search the business name on Google Maps or Google Search.</li>
                          <li>Click the <strong>&quot;Ask for reviews&quot;</strong> button in the manager widget.</li>
                          <li>Copy the direct short link (e.g. <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded">https://g.page/r/.../review</code>) and paste it here!</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00aa6c]"></span>
                        <span>Review Platform Target</span>
                      </label>
                      <select
                        value={formData.reviewPlatform}
                        onChange={(e) => setFormData({ ...formData, reviewPlatform: e.target.value })}
                        className="text-xs p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="GOOGLE">Google Reviews Only</option>
                        <option value="TRIPADVISOR">TripAdvisor Only</option>
                        <option value="BOTH">Both (Customer Chooses)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">TripAdvisor Direct Review Link (URL)</label>
                        <button
                          type="button"
                          onClick={() => setShowTripadvisorHelpCreate(!showTripadvisorHelpCreate)}
                          className="text-[11px] font-semibold text-[#00aa6c] hover:underline flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{showTripadvisorHelpCreate ? "Hide" : "How to get this link?"}</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.tripadvisorReviewUrl}
                          onChange={(e) => setFormData({ ...formData, tripadvisorReviewUrl: e.target.value })}
                          placeholder="https://www.tripadvisor.com/UserReviewEdit-g... or listing URL"
                          className="flex-1 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00aa6c] font-mono"
                        />
                        {formData.tripadvisorReviewUrl && (
                          <a
                            href={formData.tripadvisorReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-[#00aa6c]/20 text-[#00aa6c] border border-[#00aa6c]/30 rounded-xl text-xs font-semibold hover:bg-[#00aa6c]/30 flex items-center gap-1 shrink-0"
                            title="Test TripAdvisor link"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Test</span>
                          </a>
                        )}
                      </div>

                      {showTripadvisorHelpCreate && (
                        <div className="mt-2 p-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-xs text-slate-300 space-y-1 text-[11px]">
                          <p className="font-bold text-emerald-400">Official TripAdvisor URL format:</p>
                          <p>Go to your business page on TripAdvisor, click "Write a review", and paste the resulting URL (e.g. <code>https://www.tripadvisor.com/UserReviewEdit-g...</code>).</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        &quot;Powered by&quot; Label
                      </label>
                      <input
                        type="text"
                        value={formData.poweredByText}
                        onChange={(e) => setFormData({ ...formData, poweredByText: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        &quot;Powered by&quot; URL
                      </label>
                      <input
                        type="text"
                        value={formData.poweredByUrl}
                        onChange={(e) => setFormData({ ...formData, poweredByUrl: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client User Login */}
              <div className="pt-2 border-t border-slate-700/60">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                  Client Admin User Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Sarah Mitchell"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Login Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="owner@apexdental.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Login Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Create Business & Subscription"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= STANDEE ORDERS MANAGEMENT MODAL ================= */}
      {ordersModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>Physical Standee Orders</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {standeeOrders.length} Total
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Custom printed QR table tents ordered by client businesses for fulfillment by Unbox Studio.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchStandeeOrders}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  title="Refresh Orders"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOrdersModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingOrders ? (
              <div className="text-center py-16 text-slate-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Loading standee orders...</p>
              </div>
            ) : standeeOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">No standee orders placed yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  When business owners click &quot;Order Standee&quot; from their dashboard, deliveries appear here for shipping.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {standeeOrders.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-5 bg-slate-800/80 border border-slate-700/70 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          #{ord.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-white">{ord.business?.name || "Business"}</span>
                        <span className="text-xs text-slate-400">• {new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1">
                        <div>
                          <strong>Item:</strong>{" "}
                          <span className="text-blue-300 font-medium">
                            {ord.standeeType === "WOODEN_A5"
                              ? "Deluxe Wood & Acrylic Stand (A5)"
                              : ord.standeeType === "METAL_TENT"
                              ? "Brushed Metal Countertop Tent"
                              : "Premium Crystal Acrylic (A6)"}
                          </span>{" "}
                          • <span className="font-bold text-white">{ord.quantity} Unit(s)</span> (₹{ord.totalPrice})
                        </div>

                        <div className="flex items-start gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Deliver to:</strong> {ord.contactName} ({ord.contactPhone})<br />
                            {ord.shippingAddress}, {ord.city} {ord.postalCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Fulfillment Controls */}
                    <div className="flex flex-col gap-2 shrink-0 md:w-52">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-semibold">Status:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border font-bold focus:outline-none ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : ord.status === "SHIPPED"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <option value="PENDING" className="bg-slate-900 text-white">Pending</option>
                          <option value="PROCESSING" className="bg-slate-900 text-white">Processing</option>
                          <option value="SHIPPED" className="bg-slate-900 text-white">Shipped</option>
                          <option value="DELIVERED" className="bg-slate-900 text-white">Delivered</option>
                          <option value="CANCELLED" className="bg-slate-900 text-white">Cancelled</option>
                        </select>
                      </div>

                      <a
                        href={`https://wa.me/${ord.contactPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${ord.contactName}, this is Unbox Studio regarding your QR Standee Order #${ord.id.slice(-8).toUpperCase()} for ${ord.business?.name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-950 text-slate-300 hover:text-white rounded-xl text-xs font-semibold text-center border border-slate-700 transition-colors"
                      >
                        Contact on WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ================= ADD / EDIT PLAN MODAL ================= */}
      {planModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>{editingPlan ? "Edit Subscription Plan" : "Add New Subscription Plan"}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure tier code, pricing, and feature list for client subscriptions
                </p>
              </div>
              <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plan Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STARTER, GROWTH, PRO"
                    value={planForm.code}
                    onChange={(e) => setPlanForm({ ...planForm, code: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Growth Pro Tier"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Perfect for multi-location clinics & established restaurants"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planForm.monthlyPrice}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyPrice: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planForm.annualPrice}
                    onChange={(e) => setPlanForm({ ...planForm, annualPrice: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={planForm.sortOrder}
                    onChange={(e) => setPlanForm({ ...planForm, sortOrder: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Features (1 bullet per line)
                </label>
                <textarea
                  rows={4}
                  placeholder={"1 Branded Center-Logo QR Code\nUnlimited Customer Scans\nPrivate Negative Feedback Shield\nBasic Keyword Weaving"}
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.isPopular}
                    onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Mark as &quot;Most Popular&quot;</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span>Active &amp; Available for Purchase</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT COUPON MODAL ================= */}
      {couponModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <span>{editingCoupon ? "Edit Coupon Code" : "Create Coupon Code"}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure discount percentages, usage limits, and expiration dates
                </p>
              </div>
              <button onClick={() => setCouponModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE50, WELCOME20"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FLAT">Flat Amount (₹ Off)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 50% discount for early bird subscribers"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Discount Value {couponForm.discountType === "PERCENTAGE" ? "(%)" : "(₹)"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={couponForm.discountType === "PERCENTAGE" ? 100 : 100000}
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Leave blank for unlimited"
                    value={couponForm.maxUses || ""}
                    onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value ? Number(e.target.value) : null })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry / Valid Until</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Active for checkout</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= GENERATE / EDIT OFFER MODAL ================= */}
      {offerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-400" />
                  <span>{editingOffer ? "Edit Promotional Offer" : "Generate Promotional Offer"}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Publish announcement banners and promotional campaigns to client dashboards
                </p>
              </div>
              <button onClick={() => setOfferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Offer Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Custom Standee with Annual Plan!"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle / Details</label>
                <input
                  type="text"
                  placeholder="e.g. Upgrade your subscription today and receive a handcrafted wooden QR standee shipped to your doorstep."
                  value={offerForm.subtitle}
                  onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. LIMITED OFFER"
                    value={offerForm.badgeText}
                    onChange={(e) => setOfferForm({ ...offerForm, badgeText: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Linked Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FREESTANDEE"
                    value={offerForm.couponCode}
                    onChange={(e) => setOfferForm({ ...offerForm, couponCode: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={offerForm.bannerColor}
                      onChange={(e) => setOfferForm({ ...offerForm, bannerColor: e.target.value })}
                      className="w-9 h-9 p-0.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={offerForm.bannerColor}
                      onChange={(e) => setOfferForm({ ...offerForm, bannerColor: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                  <select
                    value={offerForm.targetAudience}
                    onChange={(e) => setOfferForm({ ...offerForm, targetAudience: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Clients</option>
                    <option value="NEW">New Signups</option>
                    <option value="RENEWAL">Renewal Due</option>
                    <option value="STARTER">Starter Tier Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={offerForm.ctaText}
                    onChange={(e) => setOfferForm({ ...offerForm, ctaText: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={offerForm.validUntil}
                    onChange={(e) => setOfferForm({ ...offerForm, validUntil: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live Preview Inside Modal */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Preview in Client Dashboard:
                </label>
                <div
                  className="p-4 rounded-2xl text-white shadow-md flex items-center justify-between gap-4"
                  style={{ backgroundColor: offerForm.bannerColor || "#2563eb" }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {offerForm.badgeText && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/30 text-white border border-white/20">
                          {offerForm.badgeText}
                        </span>
                      )}
                      {offerForm.couponCode && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400 text-slate-950">
                          {offerForm.couponCode}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold">{offerForm.title || "Offer Title"}</div>
                    {offerForm.subtitle && <div className="text-xs text-white/90">{offerForm.subtitle}</div>}
                  </div>
                  <div className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shrink-0">
                    {offerForm.ctaText || "Claim"}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={offerForm.isActive}
                    onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span>Active &amp; Visible to Clients Immediately</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  {editingOffer ? "Update Offer" : "Publish Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= GLOBAL "POWERED BY" BRANDING MODAL ================= */}
      {brandingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Platform &quot;Powered by&quot; Branding</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure white-label agency branding shown on QR standees and customer review funnels.
                </p>
              </div>
              <button onClick={() => setBrandingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGlobalBranding} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default &quot;Powered by&quot; Brand Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unbox Studio or YourAgency Name"
                  value={globalBranding.poweredByText}
                  onChange={(e) => setGlobalBranding({ ...globalBranding, poweredByText: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Destination Link (URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://unboxstudio.com"
                  value={globalBranding.poweredByUrl}
                  onChange={(e) => setGlobalBranding({ ...globalBranding, poweredByUrl: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Live Footer Badge Preview:
                </span>
                <div className="p-3 bg-white text-slate-900 rounded-xl flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <span className="text-slate-500">Customer Funnel:</span>{" "}
                    Powered by <strong className="text-blue-600">{globalBranding.poweredByText || "Unbox Studio"}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {globalBranding.poweredByUrl || "https://unboxstudio.com"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={globalBranding.applyToAllBusinesses}
                    onChange={(e) => setGlobalBranding({ ...globalBranding, applyToAllBusinesses: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span>
                    <strong>Apply to all existing client businesses</strong> (overwrites previous tenant branding)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setBrandingModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBranding}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                >
                  {savingBranding ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Save Platform Branding"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
