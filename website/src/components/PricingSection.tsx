import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { PRICING_PLANS, Plan } from '../data/mockData';

interface PricingSectionProps {
  onOpenSubscribe: (planId?: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenSubscribe }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#080b11]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent SaaS Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Space_Grotesk'] mb-4">
            Invest in Revenue-Generating Reputation
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8">
            All plans include physical custom NFC + QR stands shipped to your door, real-time sentiment routing, and a 14-day risk-free trial.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isAnnual ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isAnnual ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((plan: Plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-1 transition-all duration-300 flex flex-col justify-between ${
                  isPopular
                    ? 'bg-gradient-to-b from-indigo-500 via-cyan-400 to-indigo-600 shadow-2xl shadow-indigo-500/20 scale-102 lg:-translate-y-2'
                    : 'bg-gradient-to-b from-white/10 to-transparent hover:border-white/20'
                }`}
              >
                <div className="h-full rounded-[22px] bg-gradient-to-b from-[#111728] to-[#0a0e17] p-8 flex flex-col justify-between">
                  
                  {/* Top Part */}
                  <div>
                    {/* Badge if Popular */}
                    {isPopular && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 shadow">
                          <Sparkles className="w-3 h-3" />
                          {plan.badge}
                        </span>
                        <span className="text-xs text-cyan-300 font-semibold">Includes 3 Stands</span>
                      </div>
                    )}

                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-xl font-black text-white font-['Space_Grotesk']">{plan.name}</h3>
                    </div>

                    <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.tagline}</p>

                    {/* Price Tag */}
                    <div className="mb-6 pb-6 border-b border-white/10">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-black text-white font-['Space_Grotesk']">
                          ${price}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/ month</span>
                      </div>
                      <p className="text-[11px] text-cyan-400 font-medium mt-1">
                        {isAnnual ? 'Billed annually ($' + (price * 12) + '/yr)' : 'Billed monthly • Cancel anytime'}
                      </p>
                      <div className="mt-3 inline-block text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/5">
                        {plan.limits}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">What's Included:</p>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className={feat.startsWith('Everything') ? 'font-bold text-indigo-300' : ''}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div>
                    <button
                      onClick={() => onOpenSubscribe(plan.id)}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                        isPopular
                          ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-400 text-white shadow-indigo-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
                      }`}
                    >
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2.5">
                      No charge today • Includes free hardware shipping
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Callout */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Need 15+ locations or custom franchise SLA?</p>
              <p className="text-xs text-slate-400">We offer white-label reseller programs, custom POS plugins, and bulk hardware discounts.</p>
            </div>
          </div>
          <button
            onClick={() => onOpenSubscribe('enterprise')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 transition-colors whitespace-nowrap cursor-pointer"
          >
            Contact Franchise Sales
          </button>
        </div>

      </div>
    </section>
  );
};
