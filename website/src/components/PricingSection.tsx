import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { usePlans } from '../services/plansService';
import { Plan } from '../data/mockData';

interface PricingSectionProps {
  onOpenSubscribe: (planId?: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenSubscribe }) => {
  const { plans, loading } = usePlans();
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-slate-50/70 border-y border-slate-200">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-100/50 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>Admin-Configured SaaS Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mb-4">
            Invest in Revenue-Generating Reputation
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-8">
            All plans include physical custom NFC + QR stands shipped to your door, real-time sentiment routing, and cancel-anytime flexibility.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isAnnual ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isAnnual ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                SAVE ~20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan: Plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isPopular = plan.popular;
            const symbol = plan.currencySymbol || (plan.currency === 'USD' ? '$' : '₹');
            const annualBillingNote = plan.annualTotal
              ? `Billed annually (${symbol}${plan.annualTotal.toLocaleString()}/yr)`
              : `Billed annually (${symbol}${(plan.annualPrice * 12).toLocaleString()}/yr)`;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-1 transition-all duration-300 flex flex-col justify-between ${
                  isPopular
                    ? 'bg-gradient-to-b from-blue-600 via-indigo-500 to-blue-700 shadow-2xl shadow-blue-500/20 scale-102 lg:-translate-y-2'
                    : 'bg-slate-200/60 hover:bg-slate-300/80 shadow-md'
                }`}
              >
                <div className="h-full rounded-[22px] bg-white p-8 flex flex-col justify-between">
                  
                  {/* Top Part */}
                  <div>
                    {/* Badge if Popular */}
                    {isPopular && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
                          <Sparkles className="w-3 h-3 text-cyan-200" />
                          {plan.badge || 'MOST POPULAR'}
                        </span>
                        <span className="text-xs text-blue-700 font-semibold">Includes {plan.standsIncluded} Stand{plan.standsIncluded > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-xl font-black text-slate-900 font-['Space_Grotesk']">{plan.name}</h3>
                    </div>

                    <p className="text-xs text-slate-500 mb-6 min-h-[32px]">{plan.tagline}</p>

                    {/* Price Tag */}
                    <div className="mb-6 pb-6 border-b border-slate-200">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 font-['Space_Grotesk']">
                          {symbol}{price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ month</span>
                      </div>
                      <p className="text-[11px] text-blue-600 font-semibold mt-1">
                        {isAnnual ? annualBillingNote : 'Billed monthly • Cancel anytime'}
                      </p>
                      <div className="mt-3 inline-block text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {plan.limits}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">What's Included:</p>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className={feat.startsWith('Everything') ? 'font-bold text-blue-700' : ''}>
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
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/25'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
                      }`}
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2.5">
                      Instant activation • Includes free hardware shipping
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Callout */}
        <div className="mt-16 p-6 rounded-2xl bg-white border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Need 15+ locations or custom franchise SLA?</p>
              <p className="text-xs text-slate-500">We offer white-label reseller programs, custom POS plugins, and bulk hardware discounts.</p>
            </div>
          </div>
          <button
            onClick={() => onOpenSubscribe('pro')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            Contact Franchise Sales
          </button>
        </div>

      </div>
    </section>
  );
};
