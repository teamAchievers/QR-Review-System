"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Sparkles,
  Building2,
  CheckCircle2,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Tag,
  Radio,
  Lock,
} from "lucide-react";

interface TagData {
  id: string;
  tagCode: string;
  batchCode: string;
  type: string;
  status: string;
  label?: string | null;
}

interface Props {
  tag: TagData;
  session: { email: string; name: string; role: string } | null;
  businesses: { id: string; name: string; slug: string; city: string | null }[];
}

export default function TagClaimClient({ tag, session, businesses }: Props) {
  const router = useRouter();
  const [claimMode, setClaimMode] = useState<"EXISTING" | "NEW">("EXISTING");

  // Form states
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businesses[0]?.id || "");
  const [label, setLabel] = useState<string>(tag.label || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ businessName: string; businessSlug: string } | null>(null);

  // New business fast-onboarding form
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    googleReviewUrl: "",
    city: "",
    phone: "",
    category: "Restaurant & Cafe",
  });

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const payload: any = {
        tagCode: tag.tagCode,
        label,
      };

      if (claimMode === "EXISTING") {
        if (!selectedBusinessId) {
          setErrorMsg("Please select an existing business.");
          setSubmitting(false);
          return;
        }
        payload.businessId = selectedBusinessId;
      } else {
        if (!newBusiness.name.trim() || !newBusiness.googleReviewUrl.trim()) {
          setErrorMsg("Please provide both Business Name and Google Review Link.");
          setSubmitting(false);
          return;
        }
        payload.newBusiness = newBusiness;
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
        setErrorMsg(data.error || "Failed to link hardware tag");
      }
    } catch {
      setErrorMsg("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW A: TAG SUCCESSFULLY CLAIMED & BOUND!
  // -------------------------------------------------------------
  if (successData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Hardware Tag Activated
          </span>

          <h2 className="text-2xl font-black tracking-tight mt-3 mb-1">
            Standee is Live!
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Tag <code className="text-amber-400 font-mono font-bold">{tag.tagCode}</code> has been linked to{" "}
            <strong className="text-white">{successData.businessName}</strong>. All customer NFC taps and QR scans will
            now launch their review funnel instantly!
          </p>

          <div className="space-y-3">
            <a
              href={`/r/${successData.businessSlug}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Live Customer Funnel</span>
            </a>

            {session?.role === "SUPER_ADMIN" ? (
              <a
                href="/admin?tab=tags"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs border border-slate-700 block transition-colors"
              >
                Back to NFC &amp; Bulk QR Studio
              </a>
            ) : (
              <a
                href="/dashboard"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs border border-slate-700 block transition-colors"
              >
                Go to Business Dashboard
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: NOT LOGGED IN -> PUBLIC UNASSIGNED LANDING SCREEN
  // -------------------------------------------------------------
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6">
        <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-tight text-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span>SmartReview SaaS</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {tag.tagCode}
          </span>
        </header>

        <main className="max-w-md mx-auto w-full my-auto text-center py-10">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-6">
            <Radio className="w-10 h-10 animate-pulse text-blue-400" />
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
            Pre-Manufactured Standee
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-4 mb-2">
            Standee Ready for Activation
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-8">
            This physical NFC card / QR standee has been manufactured and tested by <strong>Unbox Studio</strong>. Are you
            the business owner or an authorized setup representative?
          </p>

          <a
            href={`/login?returnTo=/t/${tag.tagCode}`}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Sign In to Activate This Standee</span>
          </a>

          <p className="text-[11px] text-slate-500 mt-4">
            Batch: <span className="font-mono text-slate-400">{tag.batchCode}</span> • Powered by Unbox Studio
          </p>
        </main>

        <footer className="text-center text-[10px] text-slate-600 pb-2">
          SmartReview SaaS Hardware Management System
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW C: LOGGED-IN ADMIN/USER -> ACTIVE SETUP & DATA FEED SCREEN
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-600">
      <header className="max-w-xl mx-auto w-full pt-2 pb-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 font-black tracking-tight text-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="block text-xs font-black">Tag Setup &amp; Claim Studio</span>
            <span className="text-[10px] text-slate-400 font-normal">Logged in as {session.name} ({session.role})</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold block">
            {tag.tagCode}
          </span>
          <span className="text-[9px] text-slate-500">{tag.batchCode}</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full my-auto py-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-2">
              <Sparkles className="w-3 h-3" /> Field Hardware Provisioning
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Feed Data to Blank Standee
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Bind this physical QR standee or NFC tag to a business so all future scans open their review funnel.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Mode Switcher */}
          {session.role === "SUPER_ADMIN" && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setClaimMode("EXISTING")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  claimMode === "EXISTING"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Existing Client</span>
              </button>

              <button
                type="button"
                onClick={() => setClaimMode("NEW")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  claimMode === "NEW"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard New (60s)</span>
              </button>
            </div>
          )}

          <form onSubmit={handleClaim} className="space-y-4 text-xs">
            {/* OPTION 1: LINK TO EXISTING BUSINESS */}
            {claimMode === "EXISTING" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Business Client *
                </label>
                {businesses.length === 0 ? (
                  <p className="text-slate-500 text-xs py-2">
                    No businesses found. Switch to &quot;Onboard New&quot; to create one.
                  </p>
                ) : (
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    required
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.city ? `(${b.city})` : ""} — /r/{b.slug}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* OPTION 2: FAST-ONBOARD NEW CLIENT IN THE FIELD */}
            {claimMode === "NEW" && (
              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Bengal Sweets &amp; Dine"
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Review URL / Maps Link <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://g.page/r/.../review or Maps link"
                    value={newBusiness.googleReviewUrl}
                    onChange={(e) => setNewBusiness({ ...newBusiness, googleReviewUrl: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Bandra"
                      value={newBusiness.city}
                      onChange={(e) => setNewBusiness({ ...newBusiness, city: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={newBusiness.category}
                      onChange={(e) => setNewBusiness({ ...newBusiness, category: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Restaurant & Cafe">Restaurant &amp; Cafe</option>
                      <option value="Dental Clinic">Dental / Healthcare Clinic</option>
                      <option value="Salon & Spa">Salon &amp; Spa</option>
                      <option value="Hotel & Resort">Hotel &amp; Resort</option>
                      <option value="Automotive & Garage">Automotive &amp; Garage</option>
                      <option value="Retail & Boutique">Retail &amp; Boutique</option>
                      <option value="General Service">General Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={newBusiness.phone}
                    onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Placement / Desk Label */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Placement Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Table 4, Billing Counter, Main Reception, Waiter Card #2"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Helps identify which specific table or desk generated the review in analytics.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Binding Hardware...</span>
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

      <footer className="max-w-xl mx-auto w-full text-center text-[10px] text-slate-600 py-2">
        SmartReview SaaS Hardware Engine • Pre-Provisioning System
      </footer>
    </div>
  );
}
