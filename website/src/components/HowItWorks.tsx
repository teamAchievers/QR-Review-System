import React from 'react';
import { QrCode, Filter, Sparkles, ArrowRight, Smartphone, ShieldCheck, TrendingUp, Cpu } from 'lucide-react';

interface HowItWorksProps {
  onOpenSubscribe: (planId?: string) => void;
  onScrollTo: (id: string) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenSubscribe, onScrollTo }) => {
  const steps = [
    {
      number: '01',
      title: 'Customer Scans or Taps',
      subtitle: 'Native Camera Scan • Zero App Download',
      description: 'Guests simply tap their iPhone/Android to the embedded NFC chip, or point their native camera at your custom designer acrylic stand. Loads in under 0.8 seconds without requiring any login or app install.',
      icon: QrCode,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Step 1: Point & Tap',
      details: ['Works on 100% of iOS and Android smartphones', 'Tabletop stands, checkout folios, stickers & keycards', 'Pre-programmed high-frequency NTAG213 chips']
    },
    {
      number: '02',
      title: 'Smart Sentiment Routing',
      subtitle: 'The Proprietary Review Shield Gate',
      description: 'The guest is presented with an elegant 1 to 5-star rating prompt. The engine dynamically splits the traffic based on intent: 4-5 stars trigger the Google Maps VIP flow, while 1-3 stars are intercepted into private management feedback.',
      icon: Filter,
      color: 'from-amber-500 to-indigo-600',
      badge: 'Step 2: Smart Filter',
      details: ['4-5★: Auto-redirects to Google Business Profile', '1-3★: Intercepted directly into private internal portal', 'Real-time SMS & WhatsApp manager alerts under 30s']
    },
    {
      number: '03',
      title: 'AI Reply & Local SEO Domination',
      subtitle: 'Dominate Google’s Local Top 3-Pack',
      description: 'Our AI engine drafts and publishes tailored, localized responses to new Google reviews automatically. This consistent influx of fresh 5-star ratings with targeted keywords propels your business to #1 in local search rankings.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Step 3: Growth & Rank',
      details: ['AI writes personalized responses in your brand voice', 'High keyword density boosts Google Local 3-Pack rank', 'Comprehensive staff leaderboard tracks scans by employee']
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-[#080b11]">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5 text-cyan-300" />
            <span>Intelligent Automation Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Space_Grotesk'] mb-4">
            How The RevFlow Automation Works
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            A frictionless 3-step engine that captures high-volume positive reviews on autopilot while eliminating negative online feedback before it happens.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-500/30 via-cyan-500/30 to-emerald-500/30 -translate-y-12 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative z-10 rounded-3xl p-1 bg-gradient-to-b from-white/10 to-transparent hover:from-indigo-500/40 transition-all duration-300 group"
              >
                <div className="h-full rounded-[22px] bg-gradient-to-b from-[#101728] to-[#0a0e17] p-8 border border-white/5 flex flex-col justify-between">
                  <div>
                    {/* Step Number & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white/30 to-white/5 font-['Space_Grotesk'] group-hover:from-indigo-400 group-hover:to-cyan-400 transition-all">
                        {step.number}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800/80 text-cyan-300 border border-white/10">
                        {step.badge}
                      </span>
                    </div>

                    {/* Icon Circle */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} p-[1px] shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                      <div className="w-full h-full bg-[#0d1322] rounded-[15px] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-xl font-bold text-white mb-1.5 font-['Space_Grotesk']">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-400 mb-4">{step.subtitle}</p>

                    {/* Description */}
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Bullet Checklist */}
                  <div className="pt-5 border-t border-white/5 space-y-2 text-xs text-slate-400">
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold mt-0.5">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner with Quick CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-cyan-900/40 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Ready to automate your Google review generation?
              </h4>
              <p className="text-sm text-slate-300">
                Setup takes under 3 minutes. Your physical stands ship within 48 hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenSubscribe('growth')}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get 3 Free Stands & Try Free</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
