"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Sparkles,
  Building2,
  CheckCircle2,
  Plus,
  ExternalLink,
  ShieldCheck,
  Radio,
  Lock,
  Search,
  Tag,
  CreditCard,
  DollarSign,
  User,
  Mail,
  Key,
  Check,
  X,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  Phone,
  MapPin,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface TagData {
  id: string;
  tagCode: string;
  batchCode: string;
  type: string;
  status: string;
  label?: string | null;
}

interface PlanItem {
  code: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  annualPrice: number;
  isPopular?: boolean;
}

interface Props {
  tag: TagData;
  session: { id: string; email: string; name: string; role: string } | null;
  businesses: { id: string; name: string; slug: string; city: string | null; phone: string | null }[];
  plans: PlanItem[];
  paymentKeyId?: string;
  manualUpiId?: string;
}

export default function TagClaimClient({
  tag,
  session: initialSession,
  businesses: initialBusinesses,
  plans,
  paymentKeyId,
  manualUpiId,
}: Props) {
  const router = useRouter();

  // Load Razorpay Checkout Script
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const [session, setSession] = useState(initialSession);
  const [businesses, setBusinesses] = useState(initialBusinesses);

  // Unauthenticated tab choice: "SIGNUP" vs "LOGIN"
  const [publicTab, setPublicTab] = useState<"SIGNUP" | "LOGIN">("SIGNUP");

  // Inline Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Mode: "EXISTING" vs "NEW"
  const [adminMode, setAdminMode] = useState<"EXISTING" | "NEW">("EXISTING");

  // Existing Business search & select
  const [businessSearch, setBusinessSearch] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businesses[0]?.id || "");
  const [placementLabel, setPlacementLabel] = useState(tag.label || "");

  // Admin Payment / Plan settings
  const [adminPlanTier, setAdminPlanTier] = useState("GROWTH");
  const [adminBillingCycle, setAdminBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [adminAlreadyPaid, setAdminAlreadyPaid] = useState(true);
  const [adminCouponCode, setAdminCouponCode] = useState("");

  // Admin New Business form
  const [adminNewBusiness, setAdminNewBusiness] = useState({
    name: "",
    googleReviewUrl: "",
    tripadvisorReviewUrl: "",
    category: "Restaurant & Cafe",
    city: "",
    phone: "",
    contactName: "",
    email: "",
    password: "",
  });

  // Customer Self-Service Signup Form
  const [customerForm, setCustomerForm] = useState({
    contactName: "",
    email: "",
    password: "",
    businessName: "",
    category: "Restaurant & Cafe",
    city: "",
    phone: "",
    googleReviewUrl: "",
    tripadvisorReviewUrl: "",
  });

  const [customerPlanCode, setCustomerPlanCode] = useState(
    plans.find((p) => p.isPopular)?.code || plans[1]?.code || "GROWTH"
  );
  const [customerBillingCycle, setCustomerBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  // Coupon handling
  const [couponInput, setCouponInput] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // General state
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ businessName: string; businessSlug: string } | null>(null);
  const [showGoogleReviewHelp, setShowGoogleReviewHelp] = useState(false);

  // Calculate pricing for Customer Checkout
  const activePlan = plans.find((p) => p.code === customerPlanCode) || plans[0] || {
    code: "GROWTH",
    name: "Growth Pro",
    monthlyPrice: 800,
    annualPrice: 5000,
  };

  const basePrice = customerBillingCycle === "ANNUAL" ? activePlan.annualPrice : activePlan.monthlyPrice;

  let calculatedDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      calculatedDiscount = (basePrice * appliedCoupon.discountValue) / 100;
    } else {
      calculatedDiscount = appliedCoupon.discountValue;
    }
    calculatedDiscount = Math.min(basePrice, Math.max(0, calculatedDiscount));
  }

  const finalPayable = Math.max(0, basePrice - calculatedDiscount);

  // -------------------------------------------------------------
  // HANDLER: INLINE LOGIN
  // -------------------------------------------------------------
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh page so server component passes full businesses and role session
        window.location.reload();
      } else {
        setLoginError(data.error || "Invalid email or password");
      }
    } catch {
      setLoginError("Failed to sign in. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: APPLY COUPON CODE
  // -------------------------------------------------------------
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponValidating(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), amount: basePrice }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discountAmount,
        });
        setCouponInput(data.coupon.code);
      } else {
        setCouponError(data.error || "Invalid or expired coupon code");
      }
    } catch {
      setCouponError("Could not validate coupon");
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  // -------------------------------------------------------------
  // HANDLER: ADMIN PROVISIONING SUBMISSION
  // -------------------------------------------------------------
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        tagCode: tag.tagCode,
        claimType: adminMode === "EXISTING" ? "ADMIN_EXISTING" : "ADMIN_NEW",
        label: placementLabel,
      };

      if (adminMode === "EXISTING") {
        if (!selectedBusinessId) {
          setGeneralError("Please select a business client.");
          setSubmitting(false);
          return;
        }
        payload.businessId = selectedBusinessId;
        payload.planTier = adminPlanTier;
        payload.billingCycle = adminBillingCycle;
        payload.alreadyPaid = adminAlreadyPaid;
        payload.couponCode = adminCouponCode.trim() || undefined;
      } else {
        if (!adminNewBusiness.name.trim() || !adminNewBusiness.googleReviewUrl.trim()) {
          setGeneralError("Business Name and Google Review Link are required.");
          setSubmitting(false);
          return;
        }
        payload.newBusiness = {
          ...adminNewBusiness,
          planTier: adminPlanTier,
          billingCycle: adminBillingCycle,
          alreadyPaid: adminAlreadyPaid,
          couponCode: adminCouponCode.trim() || undefined,
        };
      }

      const res = await fetch("/api/tags/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessData({
          businessName: data.business.name,
          businessSlug: data.business.slug,
        });
      } else {
        setGeneralError(data.error || "Failed to link hardware standee");
      }
    } catch {
      setGeneralError("Network error occurred while linking standee.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: CUSTOMER SELF-SERVICE SIGNUP & RAZORPAY CHECKOUT
  // -------------------------------------------------------------
  const handleCustomerCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validate inputs
    if (!customerForm.businessName.trim() || !customerForm.googleReviewUrl.trim()) {
      setGeneralError("Please provide your Business Name and Google Review Link.");
      return;
    }
    if (!customerForm.email.trim() || !customerForm.password.trim() || !customerForm.contactName.trim()) {
      setGeneralError("Please complete your account contact name, email, and password.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Initialize order
      const orderRes = await fetch("/api/tags/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagCode: tag.tagCode,
          planCode: customerPlanCode,
          billingCycle: customerBillingCycle,
          couponCode: appliedCoupon?.code || undefined,
          customerEmail: customerForm.email,
          customerName: customerForm.contactName,
          businessName: customerForm.businessName,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setGeneralError(orderData.error || "Failed to initialize subscription checkout");
        setSubmitting(false);
        return;
      }

      // If 100% Free coupon: Activate immediately without gateway popup
      if (orderData.isFree) {
        const claimRes = await fetch("/api/tags/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagCode: tag.tagCode,
            claimType: "CUSTOMER_SIGNUP",
            customerSignup: customerForm,
            planTier: customerPlanCode,
            billingCycle: customerBillingCycle,
            couponCode: appliedCoupon?.code || undefined,
            payment: { isFree: true },
            label: placementLabel,
          }),
        });

        const claimData = await claimRes.json();
        if (claimRes.ok && claimData.success) {
          setSuccessData({
            businessName: claimData.business.name,
            businessSlug: claimData.business.slug,
          });
        } else {
          setGeneralError(claimData.error || "Failed to activate standee");
        }
        setSubmitting(false);
        return;
      }

      // If online payment required via Razorpay
      const finalKey = orderData.keyId || paymentKeyId;

      if (!window.Razorpay) {
        // Fallback simulation if script didn't load or in test sandbox
        const confirmSim = confirm(
          `Razorpay Test Mode: Proceed to simulate payment of ₹${orderData.payableAmount} for ${orderData.planCode || "plan"}?`
        );
        if (!confirmSim) {
          setSubmitting(false);
          return;
        }

        const claimRes = await fetch("/api/tags/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagCode: tag.tagCode,
            claimType: "CUSTOMER_SIGNUP",
            customerSignup: customerForm,
            planTier: customerPlanCode,
            billingCycle: customerBillingCycle,
            couponCode: appliedCoupon?.code || undefined,
            payment: {
              isMock: true,
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_${Date.now()}_simulated`,
              razorpay_signature: "mock_signature_approved",
            },
            label: placementLabel,
          }),
        });

        const claimData = await claimRes.json();
        if (claimRes.ok && claimData.success) {
          setSuccessData({
            businessName: claimData.business.name,
            businessSlug: claimData.business.slug,
          });
        } else {
          setGeneralError(claimData.error || "Failed to link standee");
        }
        setSubmitting(false);
        return;
      }

      // Launch official Razorpay modal
      const options = {
        key: finalKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "SmartReview SaaS",
        description: `Activate Standee (${tag.tagCode}) - ${customerPlanCode} Plan`,
        order_id: orderData.orderId,
        prefill: {
          name: customerForm.contactName,
          email: customerForm.email,
          contact: customerForm.phone,
        },
        theme: { color: "#2563eb" },
        handler: async function (response: any) {
          try {
            const claimRes = await fetch("/api/tags/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tagCode: tag.tagCode,
                claimType: "CUSTOMER_SIGNUP",
                customerSignup: customerForm,
                planTier: customerPlanCode,
                billingCycle: customerBillingCycle,
                couponCode: appliedCoupon?.code || undefined,
                payment: {
                  razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                label: placementLabel,
              }),
            });

            const claimData = await claimRes.json();
            if (claimRes.ok && claimData.success) {
              setSuccessData({
                businessName: claimData.business.name,
                businessSlug: claimData.business.slug,
              });
            } else {
              setGeneralError(claimData.error || "Payment received, but failed to link standee. Please contact support.");
            }
          } catch {
            setGeneralError("Error finalizing registration after payment.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setGeneralError(`Payment failed: ${resp.error?.description || "Transaction cancelled"}`);
        setSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      setGeneralError("An unexpected error occurred during checkout.");
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW A: SUCCESS SCREEN (STANDEE ACTIVATED)
  // -------------------------------------------------------------
  if (successData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Hardware Standee is Live
          </span>

          <h2 className="text-2xl font-black tracking-tight mt-3 mb-1">
            Standee Activated!
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Serial Code <code className="text-amber-400 font-mono font-bold">{tag.tagCode}</code> is now bound to{" "}
            <strong className="text-white">{successData.businessName}</strong>. Whenever someone taps this NFC standee
            or scans its QR code, your review funnel will launch instantly.
          </p>

          <div className="space-y-3">
            <a
              href={`/r/${successData.businessSlug}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Live Customer Funnel</span>
            </a>

            <a
              href={session?.role === "SUPER_ADMIN" ? "/admin?tab=tags" : "/dashboard"}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs border border-slate-700 block transition-colors cursor-pointer"
            >
              {session?.role === "SUPER_ADMIN" ? "Return to Hardware & Bulk QR Studio" : "Go to Client Dashboard"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: ADMIN PROVISIONING VIEW (SUPER ADMIN LOGGED IN)
  // -------------------------------------------------------------
  if (session && session.role === "SUPER_ADMIN") {
    const filteredBusinesses = businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
        b.slug.toLowerCase().includes(businessSearch.toLowerCase()) ||
        (b.city && b.city.toLowerCase().includes(businessSearch.toLowerCase()))
    );

    const activeSelectedBiz = businesses.find((b) => b.id === selectedBusinessId) || businesses[0];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-600">
        <header className="max-w-2xl mx-auto w-full pt-2 pb-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-xs font-black text-white">Admin Standee Setup &amp; Provisioning</span>
              <span className="text-[10px] text-slate-400 font-medium">Logged in as {session.name} (Admin)</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold block">
              {tag.tagCode}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">{tag.batchCode}</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto w-full my-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-2">
                <Sparkles className="w-3 h-3" /> Field Hardware Activation
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Feed Data to Standee ({tag.tagCode})
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Link this physical NFC standee to an existing customer or create a new business profile in seconds.
              </p>
            </div>

            {generalError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAdminMode("EXISTING")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  adminMode === "EXISTING"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Existing Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminMode("NEW")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  adminMode === "NEW"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Business</span>
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-5 text-xs">
              {/* SUBFLOW A: SELECT EXISTING CUSTOMER WITH SEARCH BAR */}
              {adminMode === "EXISTING" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Search &amp; Select Customer
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search business name, city, or slug..."
                        value={businessSearch}
                        onChange={(e) => setBusinessSearch(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Business Selector */}
                  <div>
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      required
                      className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {filteredBusinesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.city ? `• ${b.city}` : ""} (/r/{b.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Business Preview Card */}
                  {activeSelectedBiz && (
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                          {activeSelectedBiz.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block">{activeSelectedBiz.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">/r/{activeSelectedBiz.slug}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        Ready to Bind
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* SUBFLOW B: CREATE NEW BUSINESS (ADMIN PROVISIONED) */}
              {adminMode === "NEW" && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Business Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Blue Lagoon Seafood"
                        value={adminNewBusiness.name}
                        onChange={(e) => setAdminNewBusiness({ ...adminNewBusiness, name: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Niche</label>
                      <select
                        value={adminNewBusiness.category}
                        onChange={(e) => setAdminNewBusiness({ ...adminNewBusiness, category: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Restaurant & Cafe">Restaurant &amp; Cafe</option>
                        <option value="Dental Clinic">Dental Clinic</option>
                        <option value="Salon & Spa">Salon &amp; Spa</option>
                        <option value="Hotel & Resort">Hotel &amp; Resort</option>
                        <option value="Automotive & Garage">Automotive &amp; Garage</option>
                        <option value="Retail & Boutique">Retail &amp; Boutique</option>
                        <option value="General Service">General Business</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Google Review Direct URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://g.page/r/.../review or Maps review link"
                      value={adminNewBusiness.googleReviewUrl}
                      onChange={(e) => setAdminNewBusiness({ ...adminNewBusiness, googleReviewUrl: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">City &amp; Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi, CP"
                        value={adminNewBusiness.city}
                        onChange={(e) => setAdminNewBusiness({ ...adminNewBusiness, city: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={adminNewBusiness.phone}
                        onChange={(e) => setAdminNewBusiness({ ...adminNewBusiness, phone: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Client Login credentials (optional) */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      Client Dashboard Login Credentials (Optional)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        placeholder="Client Email (e.g. owner@gmail.com)"
                        value={adminNewBusiness.email}
                        onChange={(e) => setAdminNewBusiness({ ...adminNewBusiness, email: e.target.value })}
                        className="text-xs p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="Client Password"
                        value={adminNewBusiness.password}
                        onChange={(e) => setAdminNewBusiness({ ...adminNewBusiness, password: e.target.value })}
                        className="text-xs p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT & COUPON SECTION FOR ADMIN */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Subscription Plan &amp; Payment Options
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Subscription Plan</label>
                    <select
                      value={adminPlanTier}
                      onChange={(e) => setAdminPlanTier(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none cursor-pointer"
                    >
                      {plans.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name} (₹{p.monthlyPrice}/mo)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Billing Cycle</label>
                    <select
                      value={adminBillingCycle}
                      onChange={(e) => setAdminBillingCycle(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none cursor-pointer"
                    >
                      <option value="MONTHLY">Monthly Billing</option>
                      <option value="ANNUAL">Annual Billing</option>
                    </select>
                  </div>
                </div>

                {/* Already Paid Toggle */}
                <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer transition-colors hover:border-slate-600">
                  <input
                    type="checkbox"
                    checked={adminAlreadyPaid}
                    onChange={(e) => setAdminAlreadyPaid(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-white block">
                      Mark as Already Paid (Cash / In-Person / Offline Transfer)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Activates the subscription immediately without initiating an online transaction.
                    </span>
                  </div>
                </label>

                {/* Apply Coupon Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Apply Coupon Code (Optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FREESTANDEE or 50OFF"
                      value={adminCouponCode}
                      onChange={(e) => setAdminCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Placement / Desk Label */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Desk / Placement Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table 4, Billing Counter 1, Entrance Tent"
                  value={placementLabel}
                  onChange={(e) => setPlacementLabel(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating Standee...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Activate &amp; Link Standee ({tag.tagCode})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="max-w-2xl mx-auto w-full text-center text-[10px] text-slate-600 py-2">
          SmartReview SaaS Hardware Management • Powered by Unbox Studio
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW C: PUBLIC UNASSIGNED LANDING SCREEN (CUSTOMER ONBOARDING)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-600">
      <header className="max-w-xl mx-auto w-full pt-2 pb-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-xs font-black text-white">SmartReview SaaS</span>
            <span className="text-[10px] text-slate-400 font-medium">Hardware Setup &amp; Activation</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold block">
            {tag.tagCode}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">Unassigned Standee</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full my-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Radio className="w-7 h-7 text-blue-400 animate-pulse" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Activate Your Review Standee
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              This physical NFC standee is ready to be linked to your business. Sign in if you already have an account, or
              register below to go live in 60 seconds!
            </p>
          </div>

          {/* Tab Selector: Signup vs Login */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPublicTab("SIGNUP")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                publicTab === "SIGNUP"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sign Up New Business</span>
            </button>

            <button
              type="button"
              onClick={() => setPublicTab("LOGIN")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                publicTab === "LOGIN"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In (Existing / Admin)</span>
            </button>
          </div>

          {/* TAB 2: INLINE SIGN IN (EXISTING USER OR ADMIN) */}
          {publicTab === "LOGIN" && (
            <form onSubmit={handleInlineLogin} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-[11px] text-slate-400">
                Log in to link this standee to your existing business account or open admin field provisioning.
              </div>

              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@smartreview.io or your business email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In &amp; Proceed to Setup</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 1: NEW CUSTOMER SIGN UP & CHECKOUT */}
          {publicTab === "SIGNUP" && (
            <form onSubmit={handleCustomerCheckout} className="space-y-5 text-xs">
              {generalError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* STEP 1: BUSINESS PROFILE */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                  1. Business Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Bengal Sweets"
                      value={customerForm.businessName}
                      onChange={(e) => setCustomerForm({ ...customerForm, businessName: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Industry / Category</label>
                    <select
                      value={customerForm.category}
                      onChange={(e) => setCustomerForm({ ...customerForm, category: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Restaurant & Cafe">Restaurant &amp; Cafe</option>
                      <option value="Dental Clinic">Dental / Health Clinic</option>
                      <option value="Salon & Spa">Salon &amp; Spa</option>
                      <option value="Hotel & Resort">Hotel &amp; Resort</option>
                      <option value="Automotive & Garage">Automotive &amp; Garage</option>
                      <option value="Retail & Boutique">Retail &amp; Boutique</option>
                      <option value="General Service">General Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Google Review Direct Link <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowGoogleReviewHelp(!showGoogleReviewHelp)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>How to get link?</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://g.page/r/.../review or Google Maps Link"
                    value={customerForm.googleReviewUrl}
                    onChange={(e) => setCustomerForm({ ...customerForm, googleReviewUrl: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showGoogleReviewHelp && (
                    <div className="mt-2 p-2.5 bg-slate-950 border border-blue-500/30 rounded-xl text-[11px] text-slate-300 space-y-1">
                      <p className="font-bold text-blue-400">Quick link instructions:</p>
                      <p>
                        Open your Google Business Profile on Google Maps, click &quot;Ask for reviews&quot;, and copy the
                        short link (e.g. <code>https://g.page/r/.../review</code>).
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City &amp; Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Bandra"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: ACCOUNT CREDENTIALS */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                  2. Create Owner Account Login
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={customerForm.contactName}
                      onChange={(e) => setCustomerForm({ ...customerForm, contactName: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="owner@mybusiness.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={customerForm.password}
                      onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: PLAN SELECTION */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    3. Select Subscription Plan
                  </span>

                  {/* Billing Cycle Switch */}
                  <div className="p-0.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCustomerBillingCycle("MONTHLY")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        customerBillingCycle === "MONTHLY"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerBillingCycle("ANNUAL")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        customerBillingCycle === "ANNUAL"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>Annual</span>
                      <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1 rounded-full">Save ~20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {plans.map((p) => {
                    const isSelected = customerPlanCode === p.code;
                    const price = customerBillingCycle === "ANNUAL" ? p.annualPrice : p.monthlyPrice;
                    return (
                      <div
                        key={p.code}
                        onClick={() => setCustomerPlanCode(p.code)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-blue-900/20 border-blue-500 ring-1 ring-blue-500/50"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {p.isPopular && (
                          <span className="absolute -top-2 right-2 text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                            POPULAR
                          </span>
                        )}
                        <span className="font-bold text-white text-xs block">{p.name}</span>
                        <div className="my-1.5">
                          <span className="text-base font-black text-white">₹{price}</span>
                          <span className="text-[10px] text-slate-400">
                            /{customerBillingCycle === "ANNUAL" ? "yr" : "mo"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {p.description || "Review gating & QR engine"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: COUPON CODE */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                  4. Apply Coupon Code
                </span>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-mono font-bold text-xs text-emerald-300">{appliedCoupon.code}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {appliedCoupon.discountType === "PERCENTAGE"
                            ? `${appliedCoupon.discountValue}% Discount Applied`
                            : `₹${appliedCoupon.discountValue} Off Applied`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Have a coupon code? (e.g. FREESTANDEE)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponValidating || !couponInput.trim()}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {couponValidating ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-400 mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* STEP 5: TOTAL & RAZORPAY CTA */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Selected Plan ({customerPlanCode}):</span>
                  <span>₹{basePrice}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-400 text-xs">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span>-₹{calculatedDiscount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Total Payable:</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">₹{finalPayable}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {customerBillingCycle === "ANNUAL" ? "Billed annually" : "Billed monthly"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Checkout Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Setup...</span>
                  </>
                ) : finalPayable === 0 ? (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Activate Standee (100% Free With Coupon)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ₹{finalPayable} &amp; Activate Standee</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-500">
                🔒 Secured by Razorpay Gateway • Instant NFC &amp; QR Standee Activation
              </p>
            </form>
          )}
        </div>
      </main>

      <footer className="max-w-xl mx-auto w-full text-center text-[10px] text-slate-600 py-2">
        SmartReview SaaS Hardware Management • Powered by Unbox Studio
      </footer>
    </div>
  );
}
