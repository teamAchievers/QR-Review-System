import React from 'react';
import { QrCode, Filter, Sparkles, ArrowRight, TrendingUp, Cpu } from 'lucide-react';

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
      color: 'from-blue-600 to-indigo-600',
      badge: 'Step 1: Point & Tap',
      details: ['Works on 100% of iOS and Android smartphones', 'Tabletop stands, checkout folios, stickers & keycards', 'Pre-programmed high-frequency NTAG213 chips']
    },
    {
      number: '02',
      title: 'Smart Sentiment Routing',
      subtitle: 'The Proprietary Review Shield Gate',
      description: 'The guest is presented with an elegant 1 to 5-star rating prompt. The engine dynamically splits the traffic based on intent: 4-5 stars trigger the Google Maps VIP flow, while 1-3 stars are intercepted into private management feedback.',
      icon: Filter,
      color: 'from-amber-500 to-orange-500',
      badge: 'Step 2: Smart Filter',
      details: ['4-5★: Auto-redirects to Google Business Profile', '1-3★: Intercepted directly into private internal portal', 'Real-time SMS & WhatsApp manager alerts under 30s']
    },
    {
      number: '03',
      title: 'AI Reply & Local SEO Domination',
      subtitle: 'Dominate Google’s Local Top 3-Pack',
      description: 'Our AI engine drafts and publishes tailored, localized responses to new Google reviews automatically. This consistent influx of fresh 5-star ratings with targeted keywords propels your business to #1 in local search rankings.',
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Step 3: Growth & Rank',
      details: ['AI writes personalized responses in your brand voice', 'High keyword density boosts Google Local 3-Pack rank', 'Comprehensive staff leaderboard tracks scans by employee']
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-white">
      {/* Decorative Subtle Blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Cpu className="w-3.5 h-3.5" />
            <span>Intelligent Automation Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight font-['Space_Grotesk'] mb-4">
            How The SmartReview Engine Works
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            A frictionless 3-step engine that captures high-volume positive reviews on autopilot while eliminating negative online feedback before it happens.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 -translate-y-12 z-0" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative z-10 rounded-3xl bg-white p-8 border border-slate-200 shadow-lg shadow-slate-100 flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-slate-200 group-hover:text-blue-600 transition-colors font-['Space_Grotesk']">
                      {step.number}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon Circle */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} p-[1px] shadow-md shadow-blue-500/10 mb-6 group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold text-slate-950 mb-1.5 font-['Space_Grotesk']">
                    {step.title}
                  </h3>
                  <p className="text-xs font-bold text-blue-600 mb-4">{step.subtitle}</p>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Bullet Checklist */}
                <div className="pt-5 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                  {step.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner with Quick CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-slate-50 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-950 font-['Space_Grotesk']">
                Ready to automate your Google review generation?
              </h4>
              <p className="text-sm text-slate-600 font-normal">
                Setup takes under 3 minutes. Your physical stands ship within 48 hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenSubscribe('growth')}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get 3 Free Stands & Try Free</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
