import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  BellRing,
  Award
} from 'lucide-react';
import { RECENT_ACTIVITY } from '../data/mockData';

interface HeroProps {
  onOpenSubscribe: (planId?: string) => void;
  onScrollTo: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenSubscribe, onScrollTo }) => {
  const [activeNotificationIndex, setActiveNotificationIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNotificationIndex((prev) => (prev + 1) % RECENT_ACTIVITY.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentActivity = RECENT_ACTIVITY[activeNotificationIndex];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] md:w-[900px] md:h-[500px] bg-gradient-to-tr from-indigo-600/25 via-cyan-500/15 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Copy */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs sm:text-sm font-semibold mb-6 animate-pulse-subtle">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Smart QR Review & Reputation Shield 2.0</span>
              <span className="hidden sm:inline text-indigo-400/60">•</span>
              <span className="hidden sm:inline text-cyan-300">3.8x More 5-Star Reviews</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] font-['Space_Grotesk'] mb-6">
              Turn In-Store Guests Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                5-Star Google Reviews
              </span>{' '}
              Automatically.
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed mb-8">
              Smart designer QR stands & NFC cards with intelligent sentiment routing: 
              <strong className="text-white font-semibold"> 4 & 5 stars</strong> fly straight to Google Maps & TripAdvisor. 
              <strong className="text-amber-300 font-semibold"> 1 to 3 stars</strong> are intercepted into private manager resolution before hitting the internet.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <button
                onClick={() => onOpenSubscribe('growth')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={() => onScrollTo('funnel-simulator')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-white/15 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Test Live Scanner Demo</span>
              </button>
            </div>

            {/* Micro Highlights & Trust Checkmarks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>No app download required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>3 Free Custom Acrylic Stands</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100% Google Policy Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End 3D QR Stand & Review Simulation */}
          <div className="lg:col-span-5 relative">
            {/* Live Ticker Floating Toast */}
            <div className="absolute -top-6 left-4 right-4 z-20 flex justify-center pointer-events-none">
              <div className="glass-panel px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-500/30 bg-[#0d1525]/90 animate-fadeIn">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <span className="font-semibold text-white">{currentActivity.business}</span>
                  <span className="text-slate-400">received</span>
                  <span className="flex text-amber-400">
                    {'★'.repeat(currentActivity.rating)}
                  </span>
                  <span className="text-slate-400">on</span>
                  <span className="text-cyan-300 font-medium">{currentActivity.site}</span>
                  <span className="text-[10px] text-slate-500">({currentActivity.time})</span>
                </div>
              </div>
            </div>

            {/* 3D Physical Acrylic Stand Showcase Card */}
            <div className="relative mx-auto max-w-sm rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-700/20 to-transparent shadow-2xl">
              <div className="rounded-[22px] bg-gradient-to-b from-[#111728] to-[#0a0e17] p-6 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                
                {/* Stand Header Brand */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                      <Award className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Smart Standee Pro</h4>
                      <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active NFC + QR Sensor
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Acrylic Stand
                  </span>
                </div>

                {/* The Physical Stand Visualization Mockup */}
                <div className="relative bg-gradient-to-b from-slate-900 to-[#070b13] rounded-2xl p-5 border border-white/10 text-center shadow-inner group">
                  {/* Subtle Scanning Laser effect */}
                  <div className="absolute left-6 right-6 top-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" />
                  
                  {/* Simulated Stand Faceplate */}
                  <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 shadow-2xl flex flex-col items-center justify-between relative transform group-hover:scale-102 transition-transform duration-300">
                    {/* Top Call to Action on Stand */}
                    <div className="text-center w-full">
                      <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-tight">Rate Your Experience</p>
                      <div className="flex justify-center text-amber-500 text-xs">
                        ★★★★★
                      </div>
                    </div>

                    {/* High-Resolution Vector QR Representation */}
                    <div className="relative w-28 h-28 bg-slate-950 rounded-xl p-2 flex items-center justify-center shadow-md">
                      <QrCode className="w-24 h-24 text-white" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 bg-indigo-600 rounded-md border-2 border-white flex items-center justify-center shadow">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Instructions */}
                    <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                      <Smartphone className="w-3 h-3 text-indigo-600" />
                      <span>TAP PHONE OR SCAN</span>
                    </div>
                  </div>

                  {/* Simulated Heavy Cast Metal / Acrylic Base */}
                  <div className="w-56 h-3 mx-auto mt-3 rounded-full bg-gradient-to-r from-slate-700 via-slate-400 to-slate-700 shadow-lg" />
                  <div className="w-64 h-1.5 mx-auto bg-black/60 rounded-full blur-sm -mt-0.5" />

                  {/* Rating Selector Trigger Button */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs text-slate-400">Interactive Preview:</p>
                      <p className="text-sm font-bold text-white">Customer Taps 5 Stars</p>
                    </div>
                    <button
                      onClick={() => onScrollTo('funnel-simulator')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <span>Simulate Funnel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Floating Metric Badge Bottom Left */}
                <div className="absolute -bottom-3 -left-3 glass-panel px-3.5 py-2 rounded-xl border border-indigo-500/30 shadow-xl flex items-center gap-2.5 bg-[#0d1424]/90">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Avg. Rating Lift</p>
                    <p className="text-xs font-extrabold text-white">+0.8 Stars in 30 Days</p>
                  </div>
                </div>

                {/* Floating Metric Badge Bottom Right */}
                <div className="absolute -bottom-3 -right-3 glass-panel px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-xl flex items-center gap-2.5 bg-[#0d1424]/90">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Review Shield</p>
                    <p className="text-xs font-extrabold text-amber-300">100% Bad Reviews Intercepted</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Integration Platforms Strip */}
        <div className="mt-20 pt-8 border-t border-white/5">
          <p className="text-center text-xs uppercase tracking-widest text-slate-400 font-semibold mb-6">
            Directly Automated With Major Review & Search Ecosystems
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <span>Google Business Profile</span>
            </div>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-red-500 font-black text-xl">yelp::</span>
              <span>Yelp Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-black font-black">OO</span>
              <span>TripAdvisor</span>
            </div>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-emerald-400 font-black text-lg">★</span>
              <span>Trustpilot</span>
            </div>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-blue-500 font-black text-xl">f</span>
              <span>Facebook Recommendations</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
