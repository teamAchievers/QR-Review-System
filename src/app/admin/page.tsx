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
  Edit2,
  CreditCard,
  DollarSign,
  AlertTriangle,
  RotateCw,
} from "lucide-react";

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
  keywords: string;
  targetTone: string;
  minGoogleStar: number;
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
    keywords: "",
    targetTone: "",
    minGoogleStar: 4,
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
    keywords: "friendly staff, excellent service, high quality, highly recommended",
    targetTone: "enthusiastic and authentic",
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
          keywords: "friendly staff, excellent service, high quality, highly recommended",
          targetTone: "enthusiastic and authentic",
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
      keywords: b.keywords || "",
      targetTone: b.targetTone || "enthusiastic and authentic",
      minGoogleStar: b.minGoogleStar || 4,
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

        <div className="flex items-center gap-3">
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Google Review URL</label>
                    <input
                      type="text"
                      value={editFormData.googleReviewUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, googleReviewUrl: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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

              {/* 4. Client Admin User */}
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Restaurant, Dental, Salon"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
    </div>
  );
}
