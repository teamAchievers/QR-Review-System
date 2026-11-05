"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Star,
  ShieldCheck,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Settings,
  Inbox,
  RefreshCw,
  Phone,
  CheckCircle2,
  Clock,
  Save,
  CreditCard,
  AlertCircle,
  HelpCircle,
  AlertOctagon,
  Lock,
  Tag,
  Package,
  Truck,
  MapPin,
  X,
  Radio,
  Cpu,
  UserCheck,
  Building2,
  Plus,
  Search,
  Eye,
  Users,
} from "lucide-react";
import { NICHE_CONFIGS, getBusinessQuickTags } from "@/lib/niches";
import { convertFromInr, formatCurrency, isCurrencyStrongerThanInr, CURRENCY_METADATA } from "@/lib/currency";

interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  category: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  primaryColor: string;
  googleReviewUrl: string;
  googlePlaceId: string | null;
  keywords: string;
  targetTone: string;
  minGoogleStar: number;
  subscriptionStatus: string;
  planTier: string;
  billingCycle: string;
  planPrice: number;
  currentPeriodEnd: string | null;
  lastPaymentDate: string | null;
  createdAt?: string;
  poweredByText?: string | null;
  poweredByUrl?: string | null;
}

interface SubscriptionState {
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

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  customerName: string | null;
  customerContact: string | null;
  status: string; // NEW, IN_PROGRESS, RESOLVED
  internalNotes: string | null;
  createdAt: string;
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTabState] = useState<"clients" | "qr" | "inbox" | "settings" | "billing">("qr");

  const setActiveTab = useCallback((tab: "clients" | "qr" | "inbox" | "settings" | "billing") => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dashboard_active_tab", tab);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState(null, "", url.toString());
      } catch (e) {}
    }
  }, []);

  // Restore active tab & query actions on mount so browser refresh preserves the exact page/tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlTab = searchParams.get("tab")?.toLowerCase();
      const validTabs = ["clients", "qr", "inbox", "settings", "billing"];

      if (urlTab && validTabs.includes(urlTab)) {
        setActiveTabState(urlTab as any);
        try { localStorage.setItem("dashboard_active_tab", urlTab); } catch (e) {}
      } else {
        const savedTab = localStorage.getItem("dashboard_active_tab")?.toLowerCase();
        if (savedTab && validTabs.includes(savedTab)) {
          setActiveTabState(savedTab as any);
          const url = new URL(window.location.href);
          url.searchParams.set("tab", savedTab);
          window.history.replaceState(null, "", url.toString());
        }
      }

      if (searchParams.get("action") === "order-standee") {
        setOrderModalOpen(true);
      }
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<{ id: string; name: string; slug: string; city: string | null; category?: string | null }[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState | null>(null);
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    lowRatings: 0,
    highRatings: 0,
    copiedToGoogle: 0,
    totalFeedback: 0,
  });
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [selectedQrPlatform, setSelectedQrPlatform] = useState<"google" | "tripadvisor">("google");
  const [tripadvisorQrDataUrl, setTripadvisorQrDataUrl] = useState<string>("");
  const [loadingTripadvisorQr, setLoadingTripadvisorQr] = useState(false);
  const [isTripadvisorAllowed, setIsTripadvisorAllowed] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [dismissedOffers, setDismissedOffers] = useState<string[]>([]);

  // Checkout Coupon State (Subscription Renewal)
  const [checkoutCouponInput, setCheckoutCouponInput] = useState("");
  const [appliedCheckoutCoupon, setAppliedCheckoutCoupon] = useState<{
    code: string;
    description?: string | null;
    discountType: "PERCENTAGE" | "FLAT";
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Agent Onboarded Clients & Creation State
  const [onboardedClients, setOnboardedClients] = useState<any[]>([]);
  const [clientMetrics, setClientMetrics] = useState({ totalClients: 0, activeSubscriptions: 0, totalStandeesDeployed: 0 });
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientForView, setSelectedClientForView] = useState<any | null>(null);
  const [clientViewModalOpen, setClientViewModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);
  const [createdClientData, setCreatedClientData] = useState<any | null>(null);
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    slug: "",
    category: "Restaurant & Café",
    city: "",
    phone: "",
    email: "",
    address: "",
    googlePlaceId: "",
    googleReviewUrl: "",
    keywords: "friendly staff, excellent service, great quality, highly recommended",
    planTier: "GROWTH",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    tagCode: "",
    tagLabel: "Main Counter",
  });

  // Hardware Standee Tag Activation & Inventory State
  const [activateTagModalOpen, setActivateTagModalOpen] = useState(false);
  const [activateTagCode, setActivateTagCode] = useState("");
  const [activateTagLabel, setActivateTagLabel] = useState("");
  const [activateTagLoading, setActivateTagLoading] = useState(false);
  const [activateTagError, setActivateTagError] = useState<string | null>(null);
  const [activateTagSuccess, setActivateTagSuccess] = useState<string | null>(null);
  const [linkedTags, setLinkedTags] = useState<any[]>([]);

  // Standee Order Coupon State
  const [standeeCouponInput, setStandeeCouponInput] = useState("");
  const [appliedStandeeCoupon, setAppliedStandeeCoupon] = useState<{
    code: string;
    description?: string | null;
    discountType: "PERCENTAGE" | "FLAT";
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [standeeCouponValidating, setStandeeCouponValidating] = useState(false);
  const [standeeCouponError, setStandeeCouponError] = useState<string | null>(null);

  // Razorpay payment state
  const [payingRazorpay, setPayingRazorpay] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);
  const [mockPaymentModalOpen, setMockPaymentModalOpen] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<any>(null);

  // Physical Standee Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [standeeForm, setStandeeForm] = useState({
    standeeType: "ACRYLIC_A6",
    standeePlatform: "GOOGLE",
    quantity: 1,
    contactName: "",
    contactPhone: "",
    shippingAddress: "",
    city: "",
    postalCode: "",
    courierNotes: "",
  });

  // Settings form state
  const [savingSettings, setSavingSettings] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");
  const [detectedGeo, setDetectedGeo] = useState<{
    country: string;
    currency: string;
    currencyName: string;
    symbol: string;
    isStrongerThanInr: boolean;
    multiplier: number;
  } | null>(null);

  const getDisplayPrice = (baseInr: number) => {
    return convertFromInr(baseInr, selectedCurrency, 1.5).convertedAmount;
  };

  // Auto-detect IP location & currency on mount
  useEffect(() => {
    fetch("/api/geo/detect")
      .then((res) => res.json())
      .then((data) => {
        if (data?.currency) {
          setDetectedGeo(data);
          setSelectedCurrency(data.currency);
        }
      })
      .catch((err) => console.warn("IP Geo detection warning:", err));
  }, []);
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
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
    keywords: "",
    targetTone: "",
    minGoogleStar: 4,
    poweredByText: "Unbox Studio",
    poweredByUrl: "https://unboxstudio.com",
  });

  // Load Razorpay Checkout Script on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const isAgent = currentUser?.role === "AGENT" || currentUser?.role === "FIELD_AGENT";

  const fetchOnboardedClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await fetch("/api/dashboard/clients");
      if (res.ok) {
        const data = await res.json();
        setOnboardedClients(data.clients || []);
        if (data.metrics) setClientMetrics(data.metrics);
      }
    } catch (e) {
      console.warn("Could not fetch onboarded clients", e);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const handleOnboardCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name.trim()) {
      setOnboardError("Please enter business name");
      return;
    }
    if (!onboardForm.adminEmail.trim()) {
      setOnboardError("Please enter customer owner email");
      return;
    }
    if (!onboardForm.adminPassword || onboardForm.adminPassword.length < 6) {
      setOnboardError("Password must be at least 6 characters");
      return;
    }
    setOnboardLoading(true);
    setOnboardError(null);
    setOnboardSuccess(null);
    try {
      const res = await fetch("/api/dashboard/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setOnboardError(data.error || "Failed to onboard customer");
      } else {
        setOnboardSuccess(data.message || "Customer onboarded successfully!");
        setCreatedClientData(data.business);
        fetchOnboardedClients();
        fetchData(data.business?.id);
      }
    } catch (err: any) {
      setOnboardError(err.message || "Network error while onboarding customer");
    } finally {
      setOnboardLoading(false);
    }
  };

  const fetchLinkedTags = useCallback(async (targetBizId?: string) => {
    try {
      const bizParam = targetBizId ? `?businessId=${targetBizId}` : "";
      const res = await fetch(`/api/dashboard/tags${bizParam}`);
      if (res.ok) {
        const data = await res.json();
        setLinkedTags(data.tags || []);
      }
    } catch (e) {
      console.warn("Could not fetch linked tags", e);
    }
  }, []);

  const handleActivateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateTagCode.trim()) {
      setActivateTagError("Please enter the hardware tag serial code (e.g. TAG-D6D6EE)");
      return;
    }
    setActivateTagLoading(true);
    setActivateTagError(null);
    setActivateTagSuccess(null);
    try {
      const res = await fetch("/api/dashboard/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagCode: activateTagCode.trim().toUpperCase(),
          label: activateTagLabel.trim() || undefined,
          businessId: business?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActivateTagError(data.error || "Failed to activate hardware tag");
      } else {
        setActivateTagSuccess(data.message || "Hardware standee activated successfully!");
        setActivateTagCode("");
        setActivateTagLabel("");
        if (business?.id) fetchLinkedTags(business.id);
      }
    } catch (err: any) {
      setActivateTagError(err.message || "Network error while activating tag");
    } finally {
      setActivateTagLoading(false);
    }
  };

  const fetchData = useCallback(async (selectedBizId?: string | unknown) => {
    try {
      const bizId = typeof selectedBizId === "string" ? selectedBizId : undefined;
      const url = bizId ? `/api/dashboard/stats?businessId=${bizId}` : "/api/dashboard/stats";
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.role === "AGENT" || data.user.role === "FIELD_AGENT" || data.user.role === "SUPER_ADMIN") {
          fetchOnboardedClients();
        }
      }
      if (data.allBusinesses) setAllBusinesses(data.allBusinesses);
      if (data.isTripadvisorAllowed !== undefined) setIsTripadvisorAllowed(data.isTripadvisorAllowed);
      if (data.business) {
        setBusiness(data.business);
        fetchLinkedTags(data.business.id);
        setFormData({
          name: data.business.name || "",
          tagline: data.business.tagline || "",
          category: data.business.category || "",
          city: data.business.city || "",
          phone: data.business.phone || "",
          email: data.business.email || "",
          logoUrl: data.business.logoUrl || "",
          googleReviewUrl: data.business.googleReviewUrl || "",
          googlePlaceId: data.business.googlePlaceId || "",
          tripadvisorReviewUrl: data.business.tripadvisorReviewUrl || "",
          reviewPlatform: data.business.reviewPlatform || "GOOGLE",
          keywords: data.business.keywords || "",
          targetTone: data.business.targetTone || "",
          poweredByText: data.business.poweredByText || "Unbox Studio",
          poweredByUrl: data.business.poweredByUrl || "https://unboxstudio.com",
          minGoogleStar: data.business.minGoogleStar || 4,
        });

        // Fetch QR Code data URL (with center logo and Powered by badge)
        const qrRes = await fetch(`/api/qr?slug=${data.business.slug}`);
        const qrJson = await qrRes.json();
        if (qrJson.dataUrl) setQrDataUrl(qrJson.dataUrl);
      }
      if (data.subscriptionState) {
        setSubscriptionState(data.subscriptionState);
      }
      if (data.metrics) setMetrics(data.metrics);
      if (data.feedbacks) setFeedbacks(data.feedbacks);

        // Fetch active promotional offers
        try {
          const offerRes = await fetch("/api/offers/active");
          if (offerRes.ok) {
            const offerData = await offerRes.json();
            if (offerData.offers) setActiveOffers(offerData.offers);
          }
        } catch (e) {
          console.warn("Could not fetch offers:", e);
        }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSwitchQrPlatform = async (platform: "google" | "tripadvisor") => {
    setSelectedQrPlatform(platform);
    if (!business) return;
    if (platform === "tripadvisor" && !tripadvisorQrDataUrl) {
      setLoadingTripadvisorQr(true);
      try {
        const res = await fetch(`/api/qr?slug=${business.slug}&platform=tripadvisor`);
        const json = await res.json();
        if (json.dataUrl) setTripadvisorQrDataUrl(json.dataUrl);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTripadvisorQr(false);
      }
    }
  };

  // Apply coupon to Subscription renewal checkout
  const handleApplySubscriptionCoupon = async (codeToTry?: string) => {
    const code = (codeToTry || checkoutCouponInput).trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponValidating(true);
    setCouponError(null);
    try {
      const baseInr = subscriptionState?.planPrice || 1999;
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: baseInr }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCheckoutCoupon({
          code: data.coupon.code,
          description: data.coupon.description,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discountAmount,
        });
        setCheckoutCouponInput(data.coupon.code);
        setCouponError(null);
      } else {
        setCouponError(data.error || "Invalid or expired coupon code");
        setAppliedCheckoutCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon");
      setAppliedCheckoutCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveSubscriptionCoupon = () => {
    setAppliedCheckoutCoupon(null);
    setCheckoutCouponInput("");
    setCouponError(null);
  };

  // Apply coupon to Standee order checkout
  const handleApplyStandeeCoupon = async (codeToTry?: string) => {
    const code = (codeToTry || standeeCouponInput).trim().toUpperCase();
    if (!code) {
      setStandeeCouponError("Please enter a coupon code");
      return;
    }
    setStandeeCouponValidating(true);
    setStandeeCouponError(null);
    try {
      const standeeBasePrice = calculateStandeePrice(standeeForm.standeeType, standeeForm.quantity);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: standeeBasePrice }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedStandeeCoupon({
          code: data.coupon.code,
          description: data.coupon.description,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discountAmount,
        });
        setStandeeCouponInput(data.coupon.code);
        setStandeeCouponError(null);
      } else {
        setStandeeCouponError(data.error || "Invalid or expired coupon code");
        setAppliedStandeeCoupon(null);
      }
    } catch {
      setStandeeCouponError("Failed to validate coupon");
      setAppliedStandeeCoupon(null);
    } finally {
      setStandeeCouponValidating(false);
    }
  };

  const handleRemoveStandeeCoupon = () => {
    setAppliedStandeeCoupon(null);
    setStandeeCouponInput("");
    setStandeeCouponError(null);
  };

  // Handle Claiming a Promotional Offer (Auto-applies linked coupon directly at checkout)
  const handleClaimOffer = (offer: any) => {
    if (offer.couponCode) {
      navigator.clipboard.writeText(offer.couponCode);
      setCheckoutCouponInput(offer.couponCode);
      setStandeeCouponInput(offer.couponCode);
      handleApplySubscriptionCoupon(offer.couponCode);
      handleApplyStandeeCoupon(offer.couponCode);
    }
    const targetLink = offer.ctaLink || "/dashboard?tab=billing";
    if (targetLink === "/dashboard?action=order-standee" || targetLink.includes("order-standee")) {
      setOrderModalOpen(true);
      return;
    }
    if (targetLink.startsWith("http") || targetLink.startsWith("https://wa.me")) {
      window.open(targetLink, "_blank", "noopener,noreferrer");
      return;
    }
    if (targetLink.includes("tab=billing")) {
      setActiveTab("billing");
      return;
    }
    if (targetLink.includes("tab=qr")) {
      setActiveTab("qr");
      return;
    }
    if (targetLink.includes("tab=settings")) {
      setActiveTab("settings");
      return;
    }
    setActiveTab("billing");
  };

  // Find the top applicable offer for this client
  const currentOffer = activeOffers.find((o) => {
    if (dismissedOffers.includes(o.id)) return false;
    if (!o.isActive) return false;
    if (o.validUntil && new Date(o.validUntil) < new Date()) return false;
    if (o.targetAudience === "ALL") return true;
    if (o.targetAudience === "RENEWAL") {
      return Boolean(
        subscriptionState &&
          (subscriptionState.effectiveStatus === "DUE" ||
            (subscriptionState.daysRemaining !== null && subscriptionState.daysRemaining <= 7))
      );
    }
    if (o.targetAudience === "NEW") {
      if (!business?.createdAt) return true;
      const created = new Date(business.createdAt);
      const ageInDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return ageInDays <= 14;
    }
    if (o.targetAudience === "STARTER") return business?.planTier === "STARTER";
    if (o.targetAudience === "GROWTH") return business?.planTier === "GROWTH";
    return true;
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Launch Razorpay Payment Flow (Supports Coupon Code and 100% Free Activation)
  const handlePayWithRazorpay = async () => {
    setPayingRazorpay(true);
    try {
      const orderRes = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCurrency: selectedCurrency,
          couponCode: appliedCheckoutCoupon?.code || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create payment order");
        setPayingRazorpay(false);
        return;
      }

      // If it is a 100% free coupon order
      if (orderData.isFreeOrder) {
        setPaymentSuccessToast(orderData.message || "Subscription activated successfully with 100% discount!");
        setAppliedCheckoutCoupon(null);
        setCheckoutCouponInput("");
        setTimeout(() => setPaymentSuccessToast(null), 4000);
        fetchData();
        setPayingRazorpay(false);
        return;
      }

      // If official Razorpay checkout script is loaded and not a mock order
      if (typeof window !== "undefined" && (window as any).Razorpay && !orderData.isMock) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Unbox Studio",
          description: `${orderData.businessName} - ${orderData.planTier} Plan Renewal${
            orderData.couponCode ? ` (Coupon: ${orderData.couponCode})` : ""
          }`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                couponCode: orderData.couponCode,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setPaymentSuccessToast("Payment verified via Razorpay! Your subscription is active.");
              setAppliedCheckoutCoupon(null);
              setCheckoutCouponInput("");
              setTimeout(() => setPaymentSuccessToast(null), 4000);
              fetchData();
            } else {
              alert(verifyData.error || "Payment verification failed");
            }
          },
          prefill: {
            name: business?.name || "",
            email: business?.email || "",
            contact: business?.phone || "",
          },
          theme: {
            color: "#2563eb",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setPayingRazorpay(false);
      } else {
        // Test / Demo Checkout Mode
        setPendingOrderDetails(orderData);
        setMockPaymentModalOpen(true);
        setPayingRazorpay(false);
      }
    } catch (err) {
      console.error(err);
      setPayingRazorpay(false);
    }
  };

  // Confirm Simulated Razorpay Payment in Test Mode
  const handleConfirmMockPayment = async () => {
    setPayingRazorpay(true);
    try {
      const verifyRes = await fetch("/api/payment/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: pendingOrderDetails?.orderId || `order_${Date.now()}`,
          razorpay_payment_id: `pay_${Date.now()}_simulated`,
          razorpay_signature: "mock_signature_approved",
          isMock: true,
          couponCode: pendingOrderDetails?.couponCode || appliedCheckoutCoupon?.code || undefined,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        setMockPaymentModalOpen(false);
        setAppliedCheckoutCoupon(null);
        setCheckoutCouponInput("");
        setPaymentSuccessToast("Razorpay payment approved! Subscription renewed & features reactivated.");
        setTimeout(() => setPaymentSuccessToast(null), 4000);
        fetchData();
      } else {
        alert(verifyData.error || "Payment verification failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPayingRazorpay(false);
    }
  };

  const handleCopyFunnelLink = () => {
    if (!business) return;
    const url = `${window.location.origin}/r/${business.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadBrandedPng = () => {
    const activeQrUrl = (isTripadvisorAllowed && (isTripadvisorAllowed && selectedQrPlatform === "tripadvisor")) ? tripadvisorQrDataUrl : qrDataUrl;
    if (!activeQrUrl || !business) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1120;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1000, 1120);
        ctx.drawImage(img, 0, 0, 1000, 1120);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `qr-${business.slug}-${selectedQrPlatform}-branded.png`;
        a.click();
      }
    };
    img.src = activeQrUrl;
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string, newStatus: string, currentNotes: string | null) => {
    try {
      await fetch("/api/dashboard/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId,
          status: newStatus,
          internalNotes: currentNotes,
        }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async (feedbackId: string, newNotes: string, currentStatus: string) => {
    try {
      await fetch("/api/dashboard/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId,
          status: currentStatus,
          internalNotes: newNotes,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const calculateStandeePrice = (type: string, qty: number) => {
    const basePrices: Record<string, number> = {
      ACRYLIC_A6: 499,
      WOODEN_A5: 799,
      METAL_TENT: 699,
    };
    const base = basePrices[type] || 499;
    const discount = qty === 2 ? 100 : qty === 3 ? 250 : qty >= 5 ? 600 : 0;
    return Math.max(0, base * qty - discount);
  };

  const handlePlaceStandeeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standeeForm.contactName.trim() || !standeeForm.contactPhone.trim() || !standeeForm.shippingAddress.trim()) {
      alert("Please fill in contact name, phone, and complete shipping address.");
      return;
    }

    setOrderSubmitting(true);
    try {
      const price = calculateStandeePrice(standeeForm.standeeType, standeeForm.quantity);
      const res = await fetch("/api/dashboard/orders/standee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...standeeForm,
          totalPrice: price,
          couponCode: appliedStandeeCoupon?.code || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data.order);
      } else {
        alert(data.error || "Failed to place standee order.");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order. Please try again.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Dedicated Print Function: Prints ONLY the standee card with zero dashboard clutter
  const handlePrintStandee = () => {
    const standeeEl = document.getElementById("printable-standee");
    if (!standeeEl) {
      window.print();
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const bName = business?.name || "Our Business";
    const bCity = business?.city || "";
    const bColor = business?.primaryColor || "#2563eb";

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Standee - ${bName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 24px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 95vh;
              background: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            .standee-card {
              max-width: 360px;
              width: 100%;
              border: 2px solid #cbd5e1;
              border-radius: 28px;
              padding: 36px 24px 28px;
              text-align: center;
              position: relative;
              background: #ffffff;
              overflow: hidden;
            }
            .accent-bar {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 10px;
              background: linear-gradient(to right, #2563eb, #4f46e5);
            }
            .logo-badge {
              width: 54px;
              height: 54px;
              border-radius: 16px;
              margin: 0 auto 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: 24px;
              background-color: ${bColor};
            }
            h1 {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              line-height: 1.25;
            }
            .city {
              font-size: 12px;
              color: #64748b;
              margin: 4px 0 10px;
            }
            .stars {
              color: #fbbf24;
              font-size: 22px;
              letter-spacing: 4px;
              margin: 8px 0;
            }
            h2 {
              font-size: 16px;
              font-weight: 700;
              color: #1e293b;
              margin: 12px 0 4px;
            }
            .subtitle {
              font-size: 12px;
              color: #64748b;
              margin: 0 0 16px;
              line-height: 1.4;
            }
            .qr-wrap {
              display: inline-block;
              padding: 10px;
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 20px;
              margin-bottom: 14px;
            }
            .qr-img {
              width: 190px;
              height: 190px;
              display: block;
              border-radius: 12px;
            }
            .pill {
              font-size: 11px;
              font-weight: 600;
              color: #475569;
              background: #f1f5f9;
              padding: 6px 14px;
              border-radius: 9999px;
              display: inline-block;
            }
            .brand-footer {
              margin-top: 20px;
              padding-top: 12px;
              border-top: 1px solid #f1f5f9;
              font-size: 11px;
              color: #94a3b8;
            }
            .brand-footer strong {
              color: #334155;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="accent-bar" style="${selectedQrPlatform === 'tripadvisor' ? 'background: linear-gradient(90deg, #00aa6c, #008f5a);' : ''}"></div>
            <div class="logo-badge" style="${selectedQrPlatform === 'tripadvisor' ? 'background: #00aa6c;' : ''}">${bName.charAt(0)}</div>
            <h1>${bName}</h1>
            ${bCity ? `<div class="city">${bCity}</div>` : ""}
            ${selectedQrPlatform === 'tripadvisor'
              ? `<div style="display:flex; justify-content:center; gap:6px; margin: 8px 0;">
                  <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#00aa6c;"></span>
                  <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#00aa6c;"></span>
                  <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#00aa6c;"></span>
                  <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#00aa6c;"></span>
                  <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#00aa6c;"></span>
                </div>`
              : `<div class="stars">★★★★★</div>`
            }
            <h2>${selectedQrPlatform === 'tripadvisor' ? 'Review Us on TripAdvisor' : 'How Was Your Visit?'}</h2>
            <div class="subtitle">${selectedQrPlatform === 'tripadvisor' ? 'Scan with your camera to review us on TripAdvisor' : 'Scan with your phone camera to share your honest thoughts with us'}</div>
            <div class="qr-wrap">
              <img src="${selectedQrPlatform === 'tripadvisor' ? (tripadvisorQrDataUrl || qrDataUrl) : qrDataUrl}" class="qr-img" alt="Scan to Review" />
            </div>
            <div>
              <span class="pill">${selectedQrPlatform === 'tripadvisor' ? '🟢 Official TripAdvisor Review' : '⚡ Quick 15-second feedback'}</span>
            </div>
            <div class="brand-footer">
              Powered by <strong>${business?.poweredByText || "Unbox Studio"}</strong>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 350);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tripadvisorReviewUrl: formData.tripadvisorReviewUrl,
          reviewPlatform: formData.reviewPlatform,
        }),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading || !business || !subscriptionState) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSuspended = subscriptionState.isSuspended;
  const isPaymentPending = subscriptionState.isPaymentPending;
  const publicReviewUrl = typeof window !== "undefined" ? `${window.location.origin}/r/${business.slug}` : `/r/${business.slug}`;

    const filteredClients = onboardedClients.filter((c) => {
    if (!clientSearch.trim()) return true;
    const q = clientSearch.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.users?.[0]?.name && c.users[0].name.toLowerCase().includes(q)) ||
      (c.users?.[0]?.email && c.users[0].email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative">
      {/* Payment Success Toast */}
      {paymentSuccessToast && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{paymentSuccessToast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-lg shadow-sm"
            style={{ backgroundColor: business.primaryColor || "#2563eb" }}
          >
            {business.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900">{business.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {business.category || "Business Client"}
              </span>
              {currentUser?.role === "FIELD_AGENT" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1 shadow-xs">
                  <span>🛠️ Field Agent:</span>
                  <span className="underline">{currentUser.name}</span>
                </span>
              )}
              {currentUser?.role === "AGENT" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-300 flex items-center gap-1 shadow-xs">
                  <span>💼 Sales Agent:</span>
                  <span className="underline">{currentUser.name}</span>
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isSuspended
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : isPaymentPending
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isSuspended
                  ? "SUSPENDED"
                  : isPaymentPending
                  ? "PAYMENT PENDING"
                  : `${subscriptionState.planTier} • ACTIVE`}
              </span>
            </div>
            <p className="text-xs text-slate-400">Review Gate &amp; Google SEO Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Client Business Switcher for Field Agents & Sales Agents */}
          {allBusinesses && allBusinesses.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Client:</span>
              <select
                value={business.id}
                onChange={(e) => fetchData(e.target.value)}
                className="text-xs bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                title="Switch client business"
              >
                {allBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city || "Direct"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isSuspended && (
            <a
              href={publicReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Test Customer Funnel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN DASHBOARD CONTAINER
          If isSuspended: GREYED OUT (grayscale, opacity, blur, pointer-events disabled)
         ========================================================================= */}
      <main className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 transition-all ${
        isSuspended ? "filter grayscale opacity-35 pointer-events-none select-none blur-[0.5px]" : ""
      }`}>
        {/* ================= ACTIVE PROMOTIONAL OFFER BANNER ================= */}
        {currentOffer && !isSuspended && (
          <div
            className="mb-6 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto"
            style={{ backgroundColor: currentOffer.bannerColor || "#2563eb" }}
          >
            <div className="space-y-1.5 flex-1 pr-2">
              <div className="flex flex-wrap items-center gap-2">
                {currentOffer.badgeText && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/30 text-white border border-white/20">
                    {currentOffer.badgeText}
                  </span>
                )}
                {currentOffer.couponCode && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950 shadow-xs">
                    <Tag className="w-3 h-3" />
                    {currentOffer.couponCode}
                  </span>
                )}
                {currentOffer.validUntil && (
                  <span className="text-[11px] text-white/80 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Expires {new Date(currentOffer.validUntil).toLocaleDateString()}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                {currentOffer.title}
              </h3>
              {currentOffer.subtitle && (
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {currentOffer.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleClaimOffer(currentOffer)}
                className="py-2.5 px-5 bg-white hover:bg-slate-50 text-slate-950 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentOffer.ctaText || "Claim Offer"}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setDismissedOffers((prev) => [...prev, currentOffer.id])}
                className="p-1.5 rounded-xl bg-black/20 hover:bg-black/35 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {/* ================= PRE-7-DAYS PAYMENT PENDING BANNER ================= */}
        {isPaymentPending && !isSuspended && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300/40">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-amber-950">Subscription Renewal Pending</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900">
                    {subscriptionState.daysRemaining !== null && subscriptionState.daysRemaining > 0
                      ? `Due in ${subscriptionState.daysRemaining} days`
                      : "Due Today"}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Your {subscriptionState.planTier} Plan renewal of <strong>{formatCurrency(getDisplayPrice(subscriptionState.planPrice), selectedCurrency)}</strong> is due on <strong>{subscriptionState.dueDate ? new Date(subscriptionState.dueDate).toLocaleDateString() : "Due date"}</strong>. Pay now via Razorpay to avoid suspension.
                </p>
              </div>
            </div>

            <button
              onClick={handlePayWithRazorpay}
              disabled={payingRazorpay}
              className="px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer pointer-events-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay ₹{subscriptionState.planPrice} with Razorpay</span>
            </button>
          </div>
        )}

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">QR Scans</span>
              <QrCode className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalScans}</div>
            <p className="text-[11px] text-slate-500 mt-1">Total customer visits</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Protected (≤ 3★)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.lowRatings}</div>
            <p className="text-[11px] text-slate-500 mt-1">Kept private from Google</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">High Ratings (4-5★)</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{metrics.highRatings}</div>
            <p className="text-[11px] text-slate-500 mt-1">Keyword-enriched reviews</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Google Posts (5★)</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{metrics.copiedToGoogle}</div>
            <p className="text-[11px] text-slate-500 mt-1">Copied &amp; redirected to Google</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto no-scrollbar">
          {(isAgent || currentUser?.role === "SUPER_ADMIN") && (
            <button
              onClick={() => setActiveTab("clients")}
              className={`pb-3 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === "clients"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>My Onboarded Clients</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "clients" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
              }`}>
                {onboardedClients.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("qr")}
            className={`pb-3 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "qr"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code &amp; Standee Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("inbox")}
            className={`pb-3 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "inbox"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Private Feedback Inbox</span>
            {feedbacks.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {feedbacks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "settings"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Keywords &amp; Logo Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`pb-3 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "billing"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription &amp; Plan</span>
          </button>
        </div>

        {/* ================= TAB 0: AGENT ONBOARDED CLIENTS ================= */}
        {activeTab === "clients" && (
          <div className="space-y-6">
            {/* Header & Quick Action */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">My Onboarded Clients</h2>
                    <p className="text-xs text-slate-500">
                      Businesses registered and provisioned by you. View customer details and live hardware status (Read-Only).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by business, city, or owner..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setOnboardError(null);
                    setOnboardSuccess(null);
                    setCreatedClientData(null);
                    setOnboardModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard New Customer</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Onboarded Clients</span>
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{clientMetrics.totalClients || onboardedClients.length}</div>
                <p className="text-[11px] text-slate-400 mt-1">Total client venues in portfolio</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Active Subscriptions</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{clientMetrics.activeSubscriptions || 0}</div>
                <p className="text-[11px] text-slate-400 mt-1">Operational review funnels</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Hardware Deployed</span>
                  <Radio className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-600">{clientMetrics.totalStandeesDeployed || 0}</div>
                <p className="text-[11px] text-slate-400 mt-1">Physical QR &amp; NFC standees</p>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              {loadingClients ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading your onboarded clients...</span>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">No Onboarded Clients Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    {clientSearch ? "No clients match your search filter." : "You have not onboarded any clients yet. Click below to register your first business."}
                  </p>
                  <button
                    onClick={() => {
                      setOnboardError(null);
                      setOnboardSuccess(null);
                      setCreatedClientData(null);
                      setOnboardModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    + Onboard First Customer
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Business &amp; Review Funnel</th>
                        <th className="py-3.5 px-4">Owner / Contact</th>
                        <th className="py-3.5 px-4">Category &amp; City</th>
                        <th className="py-3.5 px-4">Plan &amp; Status</th>
                        <th className="py-3.5 px-4">Hardware Standees</th>
                        <th className="py-3.5 px-4">Onboarded</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClients.map((client) => {
                        const owner = client.users?.[0];
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        const reviewUrl = `${origin}/r/${client.slug}`;
                        return (
                          <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 text-sm">{client.name}</div>
                              <a
                                href={reviewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                title="Open customer review funnel"
                              >
                                <span>/r/{client.slug}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">{owner?.name || "Client Owner"}</div>
                              <div className="text-[11px] text-slate-500">{owner?.email || client.email || "—"}</div>
                              {client.phone && (
                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{client.phone}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {client.category || "General"}
                              </span>
                              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{client.city || "—"}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-800">{client.planTier || "GROWTH"}</span>
                              <div className="mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  client.subscriptionStatus === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  <span>{client.subscriptionStatus || "ACTIVE"}</span>
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {client.smartTags && client.smartTags.length > 0 ? (
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    <Radio className="w-3 h-3 text-purple-600" />
                                    <span>{client.smartTags.length} Standee{client.smartTags.length === 1 ? "" : "s"}</span>
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-500">
                                    {client.smartTags[0]?.tagCode}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">No standee linked</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-[11px] text-slate-500">
                              {new Date(client.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClientForView(client);
                                    setClientViewModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="View Customer Details (Read-Only)"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    fetchData(client.id);
                                    setActiveTab("qr");
                                  }}
                                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Switch Live Standee & Funnel Studio"
                                >
                                  <QrCode className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Standee</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 1: QR CODE & STAND STUDIO ================= */}
        {activeTab === "qr" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                {/* Platform Selector Switcher */}
                {isTripadvisorAllowed && (
                  <div className="flex items-center gap-2 mb-4 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleSwitchQrPlatform("google")}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        selectedQrPlatform === "google"
                          ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>Google Review QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchQrPlatform("tripadvisor")}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        selectedQrPlatform === "tripadvisor"
                          ? "bg-[#00aa6c] text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>TripAdvisor QR</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-slate-900">
                    {(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? "TripAdvisor Review QR" : "Google Review QR"}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    (isTripadvisorAllowed && selectedQrPlatform === "tripadvisor")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? "TripAdvisor Optimized" : "Logo In Center"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Includes your logo in the center and &quot;Powered by {business?.poweredByText || "Unbox Studio"}&quot; at the bottom.
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center mb-5">
                  {((isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? (tripadvisorQrDataUrl || qrDataUrl) : qrDataUrl) ? (
                    <img
                      src={(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? (tripadvisorQrDataUrl || qrDataUrl) : qrDataUrl}
                      alt="Review QR Code"
                      className="w-56 h-auto rounded-xl shadow-xs"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-slate-200 animate-pulse rounded-xl" />
                  )}
                  <span className="mt-3 text-[11px] font-mono text-slate-500 break-all text-center">
                    {publicReviewUrl}{(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? "?platform=tripadvisor" : ""}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleCopyFunnelLink}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Link Copied to Clipboard!" : "Copy Public Review Link"}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadBrandedPng}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                    <a
                      href={`/api/qr?slug=${business.slug}&platform=${selectedQrPlatform}&format=svg`}
                      download={`qr-${business.slug}-${selectedQrPlatform}.svg`}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download SVG</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Table Tent &amp; QR Standee</h3>
                    <p className="text-xs text-slate-500">Print yourself on paper or order a high-end physical acrylic standee</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintStandee}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Standee</span>
                    </button>

                    <button
                      onClick={() => {
                        setStandeeForm((prev) => ({
                          ...prev,
                          contactName: business?.name ? `${business.name} Front Desk` : "",
                          city: business?.city || "",
                        }));
                        setOrderSuccess(null);
                        setOrderModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Package className="w-3.5 h-3.5 text-blue-200" />
                      <span>Order Standee</span>
                    </button>

                    <button
                      onClick={() => {
                        setActivateTagError(null);
                        setActivateTagSuccess(null);
                        setActivateTagModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
                      title="Activate pre-printed QR & NFC standee in field"
                    >
                      <Radio className="w-3.5 h-3.5 text-purple-200" />
                      <span>Activate Tag</span>
                    </button>
                  </div>
                </div>

                <div
                  id="printable-standee"
                  className="max-w-sm mx-auto bg-white border-2 border-slate-300 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-3 ${
                      (isTripadvisorAllowed && selectedQrPlatform === "tripadvisor")
                        ? "bg-gradient-to-r from-[#00aa6c] to-emerald-700"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600"
                    }`}
                  />

                  <div
                    className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md"
                    style={{ backgroundColor: (isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? "#00aa6c" : (business.primaryColor || "#2563eb") }}
                  >
                    {business.name.charAt(0)}
                  </div>

                  <h4 className="font-extrabold text-xl text-slate-900 leading-tight">{business.name}</h4>
                  {business.city && <p className="text-xs text-slate-400 mt-0.5">{business.city}</p>}

                  {(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? (
                    <div className="flex justify-center items-center gap-1.5 my-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="w-4 h-4 rounded-full bg-[#00aa6c] inline-block shadow-xs border border-emerald-600" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center gap-1 my-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )}

                  <h5 className="text-base font-bold text-slate-800 mt-2">
                    {(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? "Review Us on TripAdvisor" : "How Was Your Visit?"}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    {(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor")
                      ? "Scan with your phone camera to share your review on TripAdvisor"
                      : "Scan with your phone camera to share your honest thoughts with us"}
                  </p>

                  <div className="p-2 bg-slate-50 border-2 border-slate-200 rounded-2xl inline-block mb-3">
                    {((isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? (tripadvisorQrDataUrl || qrDataUrl) : qrDataUrl) && (
                      <img
                        src={(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? (tripadvisorQrDataUrl || qrDataUrl) : qrDataUrl}
                        alt="Printable QR"
                        className="w-48 h-auto rounded-lg"
                      />
                    )}
                  </div>

                  <div>
                    <div className={`text-[11px] font-semibold py-1.5 px-3 rounded-full inline-block ${
                      (isTripadvisorAllowed && selectedQrPlatform === "tripadvisor")
                        ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                        : "text-slate-600 bg-slate-100"
                    }`}>
                      {(isTripadvisorAllowed && selectedQrPlatform === "tripadvisor") ? "🟢 Official TripAdvisor Review" : "⚡ Quick 15-second feedback"}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                    Powered by <strong className="text-slate-600">{business?.poweredByText || "Unbox Studio"}</strong>
                  </div>
                </div>

                {linkedTags.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Active Hardware Standees &amp; Tags ({linkedTags.length})
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400">Synced with Master Admin</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {linkedTags.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                              <Radio className="w-3 h-3 text-purple-600" />
                              <span>{t.tagCode}</span>
                              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                ACTIVE
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {t.label ? `📍 ${t.label}` : "Counter Standee"}
                            </div>
                            {t.assignedBy && (
                              <div className="text-[10px] text-purple-700 font-medium mt-1 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-purple-500" />
                                <span>Configured by: {t.assignedBy}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Interactions</div>
                            <div className="font-bold text-slate-800 text-sm">{t.scanCount || 0}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRIVATE FEEDBACK INBOX (<= 3 STARS) ================= */}
        {activeTab === "inbox" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Private Feedback &amp; Grievances</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Shielded from Google
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Customers who rated 1 to 3 stars submit their comments here instead of posting publicly on Google Maps.
                </p>
              </div>

              <button
                onClick={fetchData}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {feedbacks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700">No negative feedback recorded!</p>
                <p className="text-xs text-slate-400 mt-1">All your customers are leaving 4 and 5 star reviews.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors bg-white shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700">({item.rating} Stars)</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Status:</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateFeedbackStatus(item.id, e.target.value, item.internalNotes)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            item.status === "RESOLVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed mb-3 border border-slate-100">
                      &ldquo;{item.comment}&rdquo;
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="space-y-1 text-slate-600">
                        <div>
                          <strong>Customer:</strong> {item.customerName || "Anonymous"}
                        </div>
                        {item.customerContact && (
                          <div className="flex items-center gap-1 text-blue-600 font-medium">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{item.customerContact}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          defaultValue={item.internalNotes || ""}
                          placeholder="Add internal resolution note (press enter)..."
                          onBlur={(e) => handleSaveNotes(item.id, e.target.value, item.status)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveNotes(item.id, (e.target as HTMLInputElement).value, item.status);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: KEYWORDS, LOGO & GOOGLE LINK SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-3xl">
            <div className="pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">SEO Keywords, Logo &amp; Google Review Configuration</h3>
                  <p className="text-xs text-slate-500">
                    Configure your destination Google Review URL, center logo, and target SEO keywords for positive reviews.
                  </p>
                </div>
                {isAgent && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>READ-ONLY (CANNOT EDIT)</span>
                  </span>
                )}
              </div>
            </div>

            {isAgent && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Agent Read-Only Access</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    As an Agent, you can view this customer&apos;s details, configuration, and SEO keywords below, but you cannot edit or overwrite them. To request modifications, contact Super Admin.
                  </p>
                </div>
              </div>
            )}

            {settingsSaved && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Settings updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Business Category / Niche <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const matchedNiche = NICHE_CONFIGS.find((n) => n.id === newCat || n.name === newCat);
                      setFormData({
                        ...formData,
                        category: newCat,
                        keywords: !formData.keywords.trim() && matchedNiche ? matchedNiche.defaultKeywords : formData.keywords,
                      });
                    }}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Industry Niche --</option>
                    {NICHE_CONFIGS.map((n) => (
                      <option key={n.id} value={n.name}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tailors customer review chips and keyword suggestions to your specific industry.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Seattle, WA or Downtown"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span>Google Review Direct Link (URL)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGoogleHelp(!showGoogleHelp)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showGoogleHelp ? "Hide instructions" : "How to get this link?"}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.googleReviewUrl}
                    onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                    placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                    className="flex-1 text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {formData.googleReviewUrl && (
                    <a
                      href={formData.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 flex items-center gap-1 shrink-0 transition-colors"
                      title="Open in new tab to verify review box opens"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Link</span>
                    </a>
                  )}
                </div>

                {/* Step-by-Step Instructions Card */}
                {showGoogleHelp && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200 rounded-2xl text-xs text-slate-700 space-y-2.5 animate-in fade-in duration-150">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>How to get your Official Google Review Direct Link:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 ml-1">
                      <li>
                        Open <strong>Google Search</strong> or <strong>Google Maps</strong> and search your business name.
                      </li>
                      <li>
                        Ensure you are logged in with the Google account that manages your <strong>Google Business Profile</strong>.
                      </li>
                      <li>
                        In your business dashboard on Google, click the <strong>&quot;Ask for reviews&quot;</strong> button (or &quot;Get more reviews&quot;).
                      </li>
                      <li>
                        A popup will appear displaying your official review link (format: <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 border border-blue-200">https://g.page/r/.../review</code>).
                      </li>
                      <li>
                        Click <strong>&quot;Copy link&quot;</strong> and paste it into the field above!
                      </li>
                    </ol>
                    <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Alternative: Use your Google Place ID to build a direct URL.</span>
                      <a
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                      >
                        <span>Place ID Finder</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Center QR Logo URL (Image Link)
                </label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">
                    Target SEO Keywords for Positive Reviews <span className="text-rose-500">*</span>
                  </label>
                  {formData.category && (
                    <button
                      type="button"
                      onClick={() => {
                        const matched = NICHE_CONFIGS.find((n) => n.id === formData.category || n.name === formData.category);
                        if (matched) {
                          setFormData({ ...formData, keywords: matched.defaultKeywords });
                        }
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Reset to Niche Suggestions
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g. authentic wood-fired pizza, handmade pasta, best restaurant in downtown"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Live Preview of Niche Chips */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-2">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview: What Your Customers See On Scan (High Rating Highlights)</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Customers tapping 4 or 5 stars will be prompted to pick from these highlights before generating their Google review:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {getBusinessQuickTags(formData.category, formData.keywords).tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

                            {/* Platform Branding & Powered By Info */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Platform Branding &amp; &quot;Powered by&quot; Badge</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full">
                    Active Branding
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  This badge is displayed at the bottom of your QR code standees and public review funnel page.
                </p>
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500">Current Badge:</span>{" "}
                    <strong className="text-slate-800">Powered by {business?.poweredByText || "Unbox Studio"}</strong>
                  </div>
                  <a
                    href={business?.poweredByUrl || "https://unboxstudio.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>{business?.poweredByUrl || "https://unboxstudio.com"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  Note: Custom white-label branding can be updated via your Master Admin panel.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                {isAgent ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Save Disabled for Agents (Read-Only)</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={savingSettings}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  {savingSettings ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 4: SUBSCRIPTION & PLAN CHECKOUT ================= */}
        {activeTab === "billing" && (
          <div className="space-y-6 max-w-4xl">
            {/* Header & Plan Overview Cards */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="pb-4 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight">Subscription &amp; Checkout</h3>
                  <p className="text-xs text-slate-500">
                    Apply promo coupons, select local currency, and renew your plan securely via Razorpay.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold text-slate-400">Currency:</span>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="INR">₹ INR (India)</option>
                    <option value="USD">$ USD (US / Global)</option>
                    <option value="EUR">€ EUR (Europe)</option>
                    <option value="GBP">£ GBP (UK)</option>
                    <option value="AED">AED (UAE / Gulf)</option>
                    <option value="CAD">$ CAD (Canada)</option>
                    <option value="AUD">$ AUD (Australia)</option>
                    <option value="SGD">$ SGD (Singapore)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Current Plan Tier
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {subscriptionState.planTier} Plan
                  </div>
                  <div className="text-sm font-bold text-blue-600 mt-1 flex items-center gap-1.5">
                    <span>{formatCurrency(getDisplayPrice(subscriptionState.planPrice), selectedCurrency)}</span>
                    <span className="text-xs text-slate-400 font-normal">/ billing cycle</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Subscription Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        isSuspended
                          ? "bg-rose-50 text-rose-700 border-rose-300"
                          : isPaymentPending
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : "bg-emerald-50 text-emerald-700 border-emerald-300"
                      }`}
                    >
                      {isSuspended
                        ? "SUSPENDED / OVERDUE"
                        : isPaymentPending
                        ? "RENEWAL DUE"
                        : "ACTIVE & PAID"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {subscriptionState.dueDate ? (
                      <>Renewal Date: <strong>{new Date(subscriptionState.dueDate).toLocaleDateString()}</strong></>
                    ) : (
                      "Active subscription"
                    )}
                  </div>
                </div>
              </div>

              {/* CHECKOUT & COUPON APPLICATION BOX */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/20">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight">Express Plan Checkout</h4>
                    <p className="text-[11px] text-slate-400">Apply a coupon code below to reduce your renewal fee</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left Column: Coupon Input & Active Coupon */}
                  <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <label className="block text-xs font-semibold text-slate-200">
                      Have a Coupon or Promo Code?
                    </label>

                    {appliedCheckoutCoupon ? (
                      <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-emerald-300">
                                {appliedCheckoutCoupon.code}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-200">
                                APPLIED
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-200/90 mt-0.5">
                              {appliedCheckoutCoupon.discountType === "PERCENTAGE"
                                ? `${appliedCheckoutCoupon.discountValue}% OFF discount applied!`
                                : `₹${appliedCheckoutCoupon.discountValue} FLAT discount applied!`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveSubscriptionCoupon}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                          title="Remove coupon"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="e.g. UNBOX50, FESTIVE30"
                              value={checkoutCouponInput}
                              onChange={(e) => {
                                setCheckoutCouponInput(e.target.value.toUpperCase());
                                setCouponError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleApplySubscriptionCoupon();
                                }
                              }}
                              className="w-full text-xs font-mono pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase placeholder:font-sans placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplySubscriptionCoupon()}
                            disabled={couponValidating || !checkoutCouponInput.trim()}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                          >
                            {couponValidating ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span>Apply</span>
                            )}
                          </button>
                        </div>

                        {couponError && (
                          <div className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-2 font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{couponError}</span>
                          </div>
                        )}

                        {/* Quick Suggestion from Current Active Offer if available */}
                        {currentOffer?.couponCode && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span>Available Offer:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCheckoutCouponInput(currentOffer.couponCode);
                                handleApplySubscriptionCoupon(currentOffer.couponCode);
                              }}
                              className="text-amber-400 hover:text-amber-300 font-mono font-bold underline decoration-amber-400/50 cursor-pointer"
                            >
                              {currentOffer.couponCode}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>Valid for renewal &amp; upgrades. Instant checkout activation.</span>
                    </div>
                  </div>

                  {/* Right Column: Order Summary & Pay Button */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200 pb-2 mb-3 border-b border-white/10 flex items-center justify-between">
                        <span>Checkout Summary</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {selectedCurrency !== "INR" ? `Converted to ${selectedCurrency}` : "Direct INR"}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>{subscriptionState.planTier} Plan (Base):</span>
                          <span className="font-semibold">
                            {formatCurrency(getDisplayPrice(subscriptionState.planPrice), selectedCurrency)}
                          </span>
                        </div>

                        {appliedCheckoutCoupon && (
                          <div className="flex justify-between text-emerald-400 font-semibold">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>Coupon ({appliedCheckoutCoupon.code}):</span>
                            </span>
                            <span>
                              - {formatCurrency(getDisplayPrice(appliedCheckoutCoupon.discountAmount), selectedCurrency)}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-white/10 pt-2.5 mt-2 flex items-baseline justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Total Amount Payable</span>
                            {selectedCurrency !== "INR" && (
                              <span className="text-[10px] text-slate-400">
                                ≈ ₹{Math.max(0, subscriptionState.planPrice - (appliedCheckoutCoupon?.discountAmount || 0))} INR
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xl sm:text-2xl font-black text-white">
                              {formatCurrency(
                                Math.max(
                                  0,
                                  getDisplayPrice(
                                    Math.max(0, subscriptionState.planPrice - (appliedCheckoutCoupon?.discountAmount || 0))
                                  )
                                ),
                                selectedCurrency
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-white/10 space-y-2">
                      <button
                        type="button"
                        onClick={handlePayWithRazorpay}
                        disabled={payingRazorpay}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {payingRazorpay ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Connecting to Gateway...</span>
                          </>
                        ) : Math.max(0, subscriptionState.planPrice - (appliedCheckoutCoupon?.discountAmount || 0)) === 0 ? (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Activate 100% Free Subscription</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>
                              Pay {formatCurrency(
                                Math.max(
                                  0,
                                  getDisplayPrice(
                                    Math.max(0, subscriptionState.planPrice - (appliedCheckoutCoupon?.discountAmount || 0))
                                  )
                                ),
                                selectedCurrency
                              )} via Razorpay
                            </span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
                        <span>UPI • Cards • NetBanking</span>
                        <span>•</span>
                        <span>256-Bit SSL Encrypted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Inclusions Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 text-xs shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Included with your {subscriptionState.planTier} Plan:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited QR scans &amp; dynamic routing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart Negative Review Shielding (&le; 3★)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Keyword Enrichment for Google &amp; TripAdvisor</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Center Logo QR code + Standee Studio</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          AFTER DUE DATE: SUSPENDED LOCKOUT POPUP MODAL (ONLY PAYMENT ENABLED)
         ========================================================================= */}
      {isSuspended && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-2 border-rose-300 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
              Service Suspended
            </span>

            <h3 className="text-xl font-extrabold text-slate-900 mt-3 mb-2">
              Subscription Overdue — Features Disabled
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Your public QR code and review link have been <strong>paused</strong>. Settle your pending renewal payment of <strong>₹{subscriptionState.planPrice}</strong> via Razorpay to instantly unlock your dashboard and reactivate your customer review funnel.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mb-4 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Tier:</span>
                <span className="font-bold">{subscriptionState.planTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Status:</span>
                <span className="font-bold text-rose-600">OVERDUE / SUSPENDED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Base Renewal Fee:</span>
                <span className="font-semibold text-slate-800">₹{subscriptionState.planPrice}</span>
              </div>
              {appliedCheckoutCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCheckoutCoupon.code}):</span>
                  <span>-₹{appliedCheckoutCoupon.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-bold text-slate-900">Total Due:</span>
                <span className="font-extrabold text-blue-600">
                  ₹{Math.max(0, subscriptionState.planPrice - (appliedCheckoutCoupon?.discountAmount || 0))}
                </span>
              </div>
            </div>

            {/* Coupon Apply for Suspended State */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={checkoutCouponInput}
                  onChange={(e) => setCheckoutCouponInput(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleApplySubscriptionCoupon()}
                  disabled={couponValidating || !checkoutCouponInput.trim()}
                  className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  {couponValidating ? "..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-[11px] text-rose-500 mt-1 text-left font-medium">{couponError}</p>
              )}
            </div>

            {/* ONLY ACTION ENABLED: PAY WITH RAZORPAY */}
            <button
              onClick={handlePayWithRazorpay}
              disabled={payingRazorpay}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              {payingRazorpay ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>
                    Pay ₹{Math.max(0, subscriptionState.planPrice - (appliedCheckoutCoupon?.discountAmount || 0))} with Razorpay
                  </span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 mt-4">
              Instant automatic reactivation via Razorpay Payment Gateway
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          RAZORPAY SIMULATION MODAL (When testing or keys not yet configured)
         ========================================================================= */}
      {mockPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">Razorpay Checkout</h3>
            <p className="text-xs text-slate-500 mb-4">
              {business.name} • {subscriptionState.planTier} Plan
            </p>

            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 text-left space-y-2 mb-5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono text-[10px] text-slate-700">{pendingOrderDetails?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-semibold text-blue-600">Razorpay (Test Mode)</span>
              </div>
              {pendingOrderDetails?.couponCode && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon ({pendingOrderDetails.couponCode}):</span>
                  <span>-₹{pendingOrderDetails.discountAmount || 0}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-blue-200 pt-2 text-sm font-bold">
                <span>Amount:</span>
                <span className="text-slate-900">
                  {formatCurrency(pendingOrderDetails?.planPrice ?? subscriptionState.planPrice, selectedCurrency)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleConfirmMockPayment}
                disabled={payingRazorpay}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {payingRazorpay ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve Payment &amp; Reactivate</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setMockPaymentModalOpen(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PHYSICAL STANDEE ORDER MODAL ================= */}
      {orderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            {orderSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-200">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1">Standee Order Confirmed!</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Thank you! Your custom QR standee order has been received by the <strong>Unbox Studio</strong> production team.
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 mb-6 text-xs text-slate-700 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="font-mono text-slate-800 font-bold">{orderSuccess.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span className="font-semibold text-slate-800">
                      {orderSuccess.standeeType === "WOODEN_A5"
                        ? "Deluxe Wood & Acrylic (A5)"
                        : orderSuccess.standeeType === "METAL_TENT"
                        ? "Brushed Metal Countertop Tent"
                        : "Premium Crystal Acrylic (A6)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-semibold text-slate-800">{orderSuccess.quantity} Unit(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Price:</span>
                    <span className="font-bold text-slate-900">₹{orderSuccess.totalPrice} (Free Delivery)</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-400">Estimated Delivery:</span>
                    <span className="font-semibold text-emerald-600">3 – 5 Business Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivering To:</span>
                    <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">
                      {orderSuccess.contactName}, {orderSuccess.city || "India"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderModalOpen(false);
                      setOrderSuccess(null);
                    }}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    Back to Dashboard
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hi Unbox Studio Team, I placed a Standee Order #${orderSuccess.id.slice(-8).toUpperCase()} for ${business?.name}. Please share shipping updates!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 text-center text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Track via WhatsApp with Unbox Studio
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                      <Truck className="w-3 h-3 text-blue-600" /> Free Pan-India Courier
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Order Physical QR Standee</h3>
                    <p className="text-xs text-slate-500">
                      Crafted &amp; customized with your logo QR by <strong>Unbox Studio</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setOrderModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePlaceStandeeOrder} className="space-y-4 text-xs">
                  {/* Step 0: Standee Platform Brand */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      1. Select Standee Brand / Portal
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: "GOOGLE", label: "Google Reviews", badge: "Google Colors" },
                        { id: "TRIPADVISOR", label: "TripAdvisor", badge: "TripAdvisor Green" },
                        { id: "DUAL", label: "Dual-Sided Standee", badge: "Google + TripAdvisor" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setStandeeForm({ ...standeeForm, standeePlatform: item.id as any })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            standeeForm.standeePlatform === item.id
                              ? "border-blue-600 bg-blue-50/40 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{item.label}</span>
                            <span className="text-[10px] text-slate-500">{item.badge}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                                    {/* Step 1: Material Selection */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      1. Select Standee Material &amp; Format
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: "ACRYLIC_A6",
                          title: "Crystal Acrylic",
                          size: "A6 (4x6\")",
                          desc: "Solid clear base",
                          price: "₹499",
                        },
                        {
                          id: "WOODEN_A5",
                          title: "Deluxe Wood",
                          size: "A5 (6x8\")",
                          desc: "Solid oak base",
                          price: "₹799",
                        },
                        {
                          id: "METAL_TENT",
                          title: "Metal Counter",
                          size: "A6 (4x6\")",
                          desc: "Brushed aluminum",
                          price: "₹699",
                        },
                      ].map((item) => {
                        const isSelected = standeeForm.standeeType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setStandeeForm({ ...standeeForm, standeeType: item.id })}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-slate-900"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">{item.title}</span>
                              <span className="font-bold text-blue-600">{item.price}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{item.size}</div>
                            <div className="text-[10px] text-slate-500 mt-1 font-medium">{item.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Quantity Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-800">2. Quantity</label>
                      <span className="text-[11px] text-emerald-600 font-semibold">Bulk discounts applied automatically</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { qty: 1, label: "1 Unit" },
                        { qty: 2, label: "2 Units (Save ₹100)" },
                        { qty: 3, label: "3 Units (Save ₹250)" },
                        { qty: 5, label: "5 Units (Save ₹600)" },
                      ].map((q) => (
                        <button
                          key={q.qty}
                          type="button"
                          onClick={() => setStandeeForm({ ...standeeForm, quantity: q.qty })}
                          className={`py-2 px-1 text-center rounded-xl border font-bold text-xs transition-all ${
                            standeeForm.quantity === q.qty
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div>{q.qty} {q.qty === 1 ? "Standee" : "Pack"}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Shipping Information */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>3. Shipping &amp; Contact Details</span>
                    </label>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Contact Person Name *"
                            value={standeeForm.contactName}
                            onChange={(e) => setStandeeForm({ ...standeeForm, contactName: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            required
                            placeholder="Phone / WhatsApp Number *"
                            value={standeeForm.contactPhone}
                            onChange={(e) => setStandeeForm({ ...standeeForm, contactPhone: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          required
                          placeholder="Complete Street Address (Shop/Clinic/Restaurant No., Building, Street) *"
                          value={standeeForm.shippingAddress}
                          onChange={(e) => setStandeeForm({ ...standeeForm, shippingAddress: e.target.value })}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="City / State"
                            value={standeeForm.city}
                            onChange={(e) => setStandeeForm({ ...standeeForm, city: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="PIN / Postal Code"
                            value={standeeForm.postalCode}
                            onChange={(e) => setStandeeForm({ ...standeeForm, postalCode: e.target.value })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Apply for Standee Order */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>Have a Standee Promo Coupon?</span>
                      </span>
                      {appliedStandeeCoupon && (
                        <button
                          type="button"
                          onClick={handleRemoveStandeeCoupon}
                          className="text-[11px] text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </label>

                    {appliedStandeeCoupon ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono font-bold text-xs text-emerald-800">{appliedStandeeCoupon.code}</span>
                          <span className="text-[11px] text-emerald-700">
                            (-₹{appliedStandeeCoupon.discountAmount} discount applied!)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. FREESTANDEE, SAVE100"
                            value={standeeCouponInput}
                            onChange={(e) => {
                              setStandeeCouponInput(e.target.value.toUpperCase());
                              setStandeeCouponError(null);
                            }}
                            className="flex-1 text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyStandeeCoupon()}
                            disabled={standeeCouponValidating || !standeeCouponInput.trim()}
                            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                          >
                            {standeeCouponValidating ? "..." : "Apply"}
                          </button>
                        </div>
                        {standeeCouponError && (
                          <p className="text-[11px] text-rose-500 mt-1 font-medium">{standeeCouponError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Total & Summary Box */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500">Total Amount Payable:</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-slate-900">
                          ₹{Math.max(
                            0,
                            calculateStandeePrice(standeeForm.standeeType, standeeForm.quantity) -
                              (appliedStandeeCoupon?.discountAmount || 0)
                          )}
                        </span>
                        {appliedStandeeCoupon && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{calculateStandeePrice(standeeForm.standeeType, standeeForm.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Free Courier Included
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Pay via Invoice / COD</div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {orderSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Package className="w-4 h-4 text-blue-200" />
                          <span>Place Standee Order (₹{calculateStandeePrice(standeeForm.standeeType, standeeForm.quantity)})</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-2">
                      Handcrafted &amp; dispatched by <strong>Unbox Studio</strong> within 48 hours.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CUSTOMER DETAILS (READ-ONLY) MODAL ================= */}
      {clientViewModalOpen && selectedClientForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setClientViewModalOpen(false);
                setSelectedClientForView(null);
              }}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">{selectedClientForView.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    READ-ONLY (CANNOT EDIT)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Customer Profile &amp; Configuration Overview (Edits Restricted for Agents)
                </p>
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-2.5 text-xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Agent View-Only Mode:</strong> You can review this customer&apos;s details, owner credentials, and hardware status below. Modifying settings requires Super Admin approval.
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Business Overview Section */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Business Overview</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Category</span>
                    <strong className="text-slate-800">{selectedClientForView.category || "General"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">City</span>
                    <strong className="text-slate-800">{selectedClientForView.city || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Plan Tier</span>
                    <strong className="text-purple-700">{selectedClientForView.planTier || "GROWTH"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone</span>
                    <strong className="text-slate-800">{selectedClientForView.phone || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email</span>
                    <strong className="text-slate-800">{selectedClientForView.email || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Subscription Status</span>
                    <strong className="text-emerald-700">{selectedClientForView.subscriptionStatus || "ACTIVE"}</strong>
                  </div>
                </div>
                {selectedClientForView.address && (
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Address</span>
                    <p className="text-slate-700">{selectedClientForView.address}</p>
                  </div>
                )}
              </div>

              {/* Owner / Admin Account Section */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Customer Dashboard Login</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Owner Full Name</span>
                    <strong className="text-slate-800">{selectedClientForView.users?.[0]?.name || "Business Admin"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Login Email</span>
                    <strong className="text-slate-800 font-mono">{selectedClientForView.users?.[0]?.email || selectedClientForView.email || "—"}</strong>
                  </div>
                </div>
              </div>

              {/* Review Links & Destination Section */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Review Funnel &amp; Google Links</span>
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Public Review Funnel</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="p-1.5 bg-white border border-slate-200 rounded-lg text-blue-700 font-mono text-[11px] flex-1 truncate">
                        {typeof window !== "undefined" ? window.location.origin : ""}/r/{selectedClientForView.slug}
                      </code>
                      <a
                        href={`/r/${selectedClientForView.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test</span>
                      </a>
                    </div>
                  </div>
                  {selectedClientForView.googleReviewUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Google Review URL</span>
                      <p className="text-[11px] text-slate-700 font-mono truncate mt-0.5">
                        {selectedClientForView.googleReviewUrl}
                      </p>
                    </div>
                  )}
                  {selectedClientForView.keywords && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Target SEO Keywords</span>
                      <p className="text-[11px] text-slate-700 mt-0.5 italic">
                        &quot;{selectedClientForView.keywords}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hardware Standees Linked */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Radio className="w-3.5 h-3.5 text-purple-600" />
                  <span>Linked Hardware Standees ({selectedClientForView.smartTags?.length || 0})</span>
                </h4>
                {selectedClientForView.smartTags && selectedClientForView.smartTags.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedClientForView.smartTags.map((tag: any) => (
                      <div key={tag.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-purple-700">{tag.tagCode}</div>
                          <div className="text-[10px] text-slate-500">{tag.label || "Standee"}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                            {tag.scanCount || 0} taps
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">No physical standees linked yet.</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Edits locked for Agent role</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setClientViewModalOpen(false);
                  setSelectedClientForView(null);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ONBOARD NEW CUSTOMER / BUSINESS MODAL ================= */}
      {onboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setOnboardModalOpen(false);
                setOnboardError(null);
                setOnboardSuccess(null);
                setCreatedClientData(null);
              }}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Onboard New Customer / Business</h3>
                <p className="text-xs text-slate-500">
                  Register a client venue, create their owner account, and link their QR standee
                </p>
              </div>
            </div>

            {onboardSuccess ? (
              <div className="space-y-4 text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Customer Successfully Onboarded!</h4>
                  <p className="text-xs text-slate-600 mt-1">{onboardSuccess}</p>
                </div>
                {createdClientData && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs max-w-md mx-auto">
                    <div className="font-bold text-slate-800 text-sm mb-1">{createdClientData.name}</div>
                    <div className="text-slate-500 text-[11px] mb-2">Review Funnel: <code className="text-blue-600">/r/{createdClientData.slug}</code></div>
                    <div className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-200 font-medium">
                      ✓ Registered under your agent portfolio. The customer can now log in to manage reviews.
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardModalOpen(false);
                      setOnboardSuccess(null);
                      setCreatedClientData(null);
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                  {createdClientData && (
                    <button
                      type="button"
                      onClick={() => {
                        setOnboardModalOpen(false);
                        setOnboardSuccess(null);
                        fetchData(createdClientData.id);
                        setActiveTab("qr");
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      View Live Standee &rarr;
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleOnboardCustomer} className="space-y-4 text-xs">
                {onboardError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{onboardError}</span>
                  </div>
                )}

                {/* Section 1: Business Details */}
                <div className="space-y-3">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>1. Business Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bella Italia Café"
                        value={onboardForm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                          setOnboardForm((prev) => ({
                            ...prev,
                            name: val,
                            slug: prev.slug === "" || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
                          }));
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Review URL Slug (/r/[slug])
                      </label>
                      <input
                        type="text"
                        placeholder="bella-italia-cafe"
                        value={onboardForm.slug}
                        onChange={(e) => setOnboardForm({ ...onboardForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Category / Industry
                      </label>
                      <select
                        value={onboardForm.category}
                        onChange={(e) => setOnboardForm({ ...onboardForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="Restaurant & Café">Restaurant &amp; Café</option>
                        <option value="Salon & Spa">Salon &amp; Spa</option>
                        <option value="Dental & Healthcare">Dental &amp; Healthcare</option>
                        <option value="Retail & Shopping">Retail &amp; Shopping</option>
                        <option value="Gym & Fitness">Gym &amp; Fitness</option>
                        <option value="Hotel & Hospitality">Hotel &amp; Hospitality</option>
                        <option value="Automotive & Service">Automotive &amp; Service</option>
                        <option value="Other Business">Other Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={onboardForm.city}
                        onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={onboardForm.phone}
                        onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Plan Tier
                      </label>
                      <select
                        value={onboardForm.planTier}
                        onChange={(e) => setOnboardForm({ ...onboardForm, planTier: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="GROWTH">Growth (Most Popular)</option>
                        <option value="STARTER">Starter Launch</option>
                        <option value="PRO">Pro Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Owner Login */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. Customer Dashboard Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Owner Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={onboardForm.adminName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, adminName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Owner Login Email *
                      </label>
                      <input
                        type="email"
                        placeholder="owner@business.com"
                        value={onboardForm.adminEmail}
                        onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Temporary Password * (min 6 characters)
                      </label>
                      <input
                        type="password"
                        placeholder="Set temporary password for owner"
                        value={onboardForm.adminPassword}
                        onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Google Review Link */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>3. Google Review Destination</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Google Review Direct URL or Place ID
                    </label>
                    <input
                      type="text"
                      placeholder="https://g.page/r/.../review or ChIJ..."
                      value={onboardForm.googleReviewUrl}
                      onChange={(e) => setOnboardForm({ ...onboardForm, googleReviewUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Can be updated later by Super Admin if customer does not have their Google link ready.
                    </p>
                  </div>
                </div>

                {/* Section 4: Initial Hardware Standee */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Radio className="w-3.5 h-3.5 text-purple-600" />
                    <span>4. Bind Physical Standee (Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Standee Tag Code (Serial)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TAG-D6D6EE"
                        value={onboardForm.tagCode}
                        onChange={(e) => setOnboardForm({ ...onboardForm, tagCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Placement Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Billing Counter"
                        value={onboardForm.tagLabel}
                        onChange={(e) => setOnboardForm({ ...onboardForm, tagLabel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOnboardModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={onboardLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {onboardLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Onboard Customer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= ACTIVATE HARDWARE TAG MODAL ================= */}
      {activateTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setActivateTagModalOpen(false);
                setActivateTagError(null);
                setActivateTagSuccess(null);
              }}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Activate Hardware Standee</h3>
                <p className="text-xs text-slate-500">Bind pre-printed NFC + QR code to &quot;{business?.name}&quot;</p>
              </div>
            </div>

            {activateTagSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Standee Activated!</h4>
                  <p className="text-xs text-slate-600 mt-1">{activateTagSuccess}</p>
                  <p className="text-[11px] text-purple-600 font-semibold mt-2">
                    ✓ Confirmed &amp; recorded in Master Admin Panel
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActivateTagModalOpen(false);
                    setActivateTagSuccess(null);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleActivateTag} className="space-y-4 text-xs">
                {activateTagError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{activateTagError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tag Serial Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TAG-D6D6EE"
                    value={activateTagCode}
                    onChange={(e) => setActivateTagCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Find the serial code printed at the bottom of the standee or on the back.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Placement / Counter Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reception Desk, Cashier Counter, Table 4"
                    value={activateTagLabel}
                    onChange={(e) => setActivateTagLabel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200/60 rounded-xl flex items-start gap-2 text-[11px] text-purple-900">
                  <UserCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    Configuring as <strong className="font-bold">{currentUser?.name || "Agent"}</strong> ({currentUser?.role === "FIELD_AGENT" ? "Field Agent" : currentUser?.role === "AGENT" ? "Sales Agent" : currentUser?.role || "Staff"}). Your identity and timestamp will be registered in the Master Admin inventory audit.
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActivateTagModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={activateTagLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {activateTagLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Radio className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Bind Standee</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
