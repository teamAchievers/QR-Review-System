import React from "react";
import Link from "next/link";
import {
  QrCode,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">SmartReview SaaS</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            Launch Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>The Multi-Tenant QR Review Funnel for Local SEO</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Turn Happy Customers into <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">5-Star Google Reviews</span> — Shielding All Negative Complaints.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          When customers scan your QR code: ratings of <strong>3 stars or less</strong> are kept completely private in your dashboard, while <strong>4 &amp; 5 stars</strong> are enriched with high-ranking SEO business keywords and copied to Google in 1 tap.
        </p>

        {/* Live Interactive Funnel Links */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/r/apex-dental"
            target="_blank"
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Test QR Funnel: Apex Dental</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75" />
          </Link>

          <Link
            href="/r/bella-napoli"
            target="_blank"
            className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Test QR Funnel: Bella Napoli Pizza</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75" />
          </Link>

          <Link
            href="/login"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Master Admin &amp; Client Login</span>
          </Link>
        </div>

        {/* How It Works Diagram Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg mb-4 border border-blue-500/20">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">QR Scan &amp; Rating Filter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customers scan a QR standee on tables, counters, or receipts. They tap a 1 to 5 star rating directly on their phone without logging in.
            </p>
            <div className="mt-4 flex gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-lg mb-4 border border-rose-500/20">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">≤ 3★: Private Grievance Shield</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unhappy ratings are routed to an internal manager feedback form. Management is alerted privately to fix the customer&apos;s issue before any damage hits public Google Maps.
            </p>
            <span className="inline-block mt-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Zero Bad Google Reviews
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 border border-emerald-500/20">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4-5★: Keyword AI &amp; Google Post</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Happy customers write brief thoughts. Our engine polishes and weaves your target SEO keywords into natural reviews, copies it to their clipboard, and launches your Google review box.
            </p>
            <span className="inline-block mt-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Boosts Local SEO Ranking
            </span>
          </div>
        </div>

        {/* SaaS Platform Highlights */}
        <div className="mt-16 bg-slate-800/50 border border-slate-700/60 rounded-3xl p-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Built as a Scalable SaaS Platform
              </span>
              <h2 className="text-2xl font-bold text-white mt-2 mb-4">
                Master Super Admin + White-Label Client Dashboards
              </h2>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Master Super Admin:</strong> Instantly provision new businesses and generate client admin accounts.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Keyword SEO Studio:</strong> Businesses customize target keywords for review stuffing.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Ready-to-Print Standee:</strong> High-resolution QR PNG/SVG downloads and printable table-tent studio.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Private Feedback Inbox:</strong> Track, resolve, and take internal notes on customer grievances.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ready to explore?
              </div>
              <div className="text-sm text-slate-300 font-medium">
                Log in to experience both the Master Admin view and Client Business view.
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                <span>Go to Login Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        SmartReview SaaS • The Intelligent QR Review Gating &amp; Google SEO Accelerator Platform
      </footer>
    </div>
  );
}
