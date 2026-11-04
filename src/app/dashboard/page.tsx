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
  AlertOctagon,
  Lock,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"qr" | "inbox" | "settings" | "billing">("qr");

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
  const [copiedLink, setCopiedLink] = useState(false);

  // Razorpay payment state
  const [payingRazorpay, setPayingRazorpay] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);
  const [mockPaymentModalOpen, setMockPaymentModalOpen] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<any>(null);

  // Settings form state
  const [savingSettings, setSavingSettings] = useState(false);
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
    keywords: "",
    targetTone: "",
    minGoogleStar: 4,
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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
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
          keywords: data.business.keywords || "",
          targetTone: data.business.targetTone || "",
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Launch Razorpay Payment Flow
  const handlePayWithRazorpay = async () => {
    setPayingRazorpay(true);
    try {
      const orderRes = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create payment order");
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
          description: `${orderData.businessName} - ${orderData.planTier} Plan Renewal`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setPaymentSuccessToast("Payment verified via Razorpay! Your subscription is active.");
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
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        setMockPaymentModalOpen(false);
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
    if (!qrDataUrl || !business) return;
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
        a.download = `qr-${business.slug}-branded.png`;
        a.click();
      }
    };
    img.src = qrDataUrl;
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900">{business.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {business.category || "Business Client"}
              </span>
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

        <div className="flex items-center gap-3">
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
                  Your {subscriptionState.planTier} Plan renewal of <strong>₹{subscriptionState.planPrice}</strong> is due on <strong>{subscriptionState.dueDate ? new Date(subscriptionState.dueDate).toLocaleDateString() : "Due date"}</strong>. Pay now via Razorpay to avoid suspension.
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
        <div className="flex border-b border-slate-200 mb-6 gap-6">
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

        {/* ================= TAB 1: QR CODE & STAND STUDIO ================= */}
        {activeTab === "qr" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-slate-900">Your Branded Review QR</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Logo In Center
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Includes your logo in the center and &quot;Powered by Unbox Studio&quot; at the bottom.
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center mb-5">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Review QR Code" className="w-56 h-auto rounded-xl shadow-xs" />
                  ) : (
                    <div className="w-56 h-56 bg-slate-200 animate-pulse rounded-xl" />
                  )}
                  <span className="mt-3 text-[11px] font-mono text-slate-500 break-all text-center">
                    {publicReviewUrl}
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
                      href={`/api/qr?slug=${business.slug}&format=svg`}
                      download={`qr-${business.slug}.svg`}
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Printable Table Tent / Card</h3>
                    <p className="text-xs text-slate-500">Ready to print for your physical storefront</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Standee</span>
                  </button>
                </div>

                <div
                  id="printable-standee"
                  className="max-w-sm mx-auto bg-white border-2 border-slate-300 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 to-indigo-600" />

                  <div
                    className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md"
                    style={{ backgroundColor: business.primaryColor || "#2563eb" }}
                  >
                    {business.name.charAt(0)}
                  </div>

                  <h4 className="font-extrabold text-xl text-slate-900 leading-tight">{business.name}</h4>
                  {business.city && <p className="text-xs text-slate-400 mt-0.5">{business.city}</p>}

                  <div className="flex justify-center gap-1 my-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <h5 className="text-base font-bold text-slate-800 mt-2">How Was Your Visit?</h5>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Scan with your phone camera to share your honest thoughts with us
                  </p>

                  <div className="p-2 bg-slate-50 border-2 border-slate-200 rounded-2xl inline-block mb-3">
                    {qrDataUrl && <img src={qrDataUrl} alt="Printable QR" className="w-48 h-auto rounded-lg" />}
                  </div>

                  <div className="text-[11px] font-semibold text-slate-600 bg-slate-100 py-1.5 px-3 rounded-full inline-block">
                    ⚡ Quick 15-second feedback
                  </div>
                </div>
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
              <h3 className="font-bold text-base text-slate-900">SEO Keywords, Logo &amp; Google Review Configuration</h3>
              <p className="text-xs text-slate-500">
                Configure your destination Google Review URL, center logo, and target SEO keywords for positive reviews.
              </p>
            </div>

            {settingsSaved && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Settings updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Google Review Direct Link (URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.googleReviewUrl}
                  onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                <label className="block font-bold text-slate-800 mb-1">
                  Target SEO Keywords for Positive Reviews <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g. authentic wood-fired pizza, handmade pasta, best restaurant in downtown"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-4 flex justify-end">
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
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 4: SUBSCRIPTION & PLAN ================= */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-3xl">
            <div className="pb-4 border-b border-slate-200 mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Subscription &amp; Razorpay Billing</h3>
                <p className="text-xs text-slate-500">
                  Manage plan tier, renewal cycles, and online payment methods.
                </p>
              </div>

              <button
                onClick={handlePayWithRazorpay}
                disabled={payingRazorpay}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{subscriptionState.planPrice} via Razorpay</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Current Plan
                </span>
                <div className="text-2xl font-extrabold text-slate-900">
                  {subscriptionState.planTier} Plan
                </div>
                <div className="text-sm font-semibold text-blue-600 mt-1">
                  ₹{subscriptionState.planPrice} / month
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
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
                      ? "SUSPENDED / LOCKED"
                      : isPaymentPending
                      ? "RENEWAL DUE"
                      : "ACTIVE & PAID"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {subscriptionState.dueDate ? (
                    <>Next Renewal: <strong>{new Date(subscriptionState.dueDate).toLocaleDateString()}</strong></>
                  ) : (
                    "Active account"
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Included in your {subscriptionState.planTier} Plan:</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited QR code scans &amp; dynamic routing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart Review Shielding (≤ 3★ complaints routed to private inbox)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Keyword Enrichment for Google 5-star reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Center Logo QR code + Printable Standee generator</span>
                </li>
              </ul>
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

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mb-6 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Tier:</span>
                <span className="font-bold">{subscriptionState.planTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Status:</span>
                <span className="font-bold text-rose-600">OVERDUE / SUSPENDED</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-bold text-slate-900">Total Due:</span>
                <span className="font-extrabold text-blue-600">₹{subscriptionState.planPrice}</span>
              </div>
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
                  <span>Pay ₹{subscriptionState.planPrice} with Razorpay</span>
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
              <div className="flex justify-between border-t border-blue-200 pt-2 text-sm font-bold">
                <span>Amount:</span>
                <span className="text-slate-900">₹{subscriptionState.planPrice}</span>
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
    </div>
  );
}
