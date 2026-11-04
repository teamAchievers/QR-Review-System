"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Lock, Mail, ArrowRight, Shield, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to log in");
      } else {
        router.push(data.redirectUrl || "/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-lg mb-4">
          <QrCode className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">SmartReview SaaS</h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to your Master Admin or Business Client portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 border border-slate-700 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartreview.io"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Demo Logins (Click to Autofill)
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@smartreview.io", "AdminPassword123!")}
                className="w-full py-2 px-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs text-left text-slate-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold block text-white">Master Super Admin</span>
                    <span className="text-[10px] text-slate-400">admin@smartreview.io</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("owner@apexdental.com", "Dental123!")}
                className="w-full py-2 px-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs text-left text-slate-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-semibold block text-white">Business: Apex Dental</span>
                    <span className="text-[10px] text-slate-400">owner@apexdental.com</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("mario@bellanapoli.com", "Pizza123!")}
                className="w-full py-2 px-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs text-left text-slate-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  <div>
                    <span className="font-semibold block text-white">Business: Bella Napoli Pizza (DUE)</span>
                    <span className="text-[10px] text-slate-400">mario@bellanapoli.com</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("spa@oasisspa.com", "Spa123!")}
                className="w-full py-2 px-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-xs text-left text-slate-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="font-semibold block text-white">Business: Oasis Spa (SUSPENDED)</span>
                    <span className="text-[10px] text-slate-400">spa@oasisspa.com</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Fill</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-400">
            ← Back to Home Page
          </a>
        </div>
      </div>
    </div>
  );
}
