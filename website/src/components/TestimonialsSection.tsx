import React from 'react';
import { Star, TrendingUp, Quote, CheckCircle2, Award } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Award className="w-3.5 h-3.5" />
            <span>Proven Business Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mb-4">
            Loved by 12,000+ Brick-and-Mortar Venues
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            See how restaurants, healthcare clinics, luxury salons, and auto groups accelerated their 5-star Google review count in under 60 days.
          </p>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl p-8 bg-slate-50/60 border border-slate-200 flex flex-col justify-between shadow-md relative group hover:bg-white hover:border-blue-400 hover:shadow-xl transition-all duration-300"
            >
              <div>
                {/* Metric Header Pill */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                    {t.metric}
                  </span>
                  <div className="flex text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                </div>

                {/* Rating Transformation Banner */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 mb-6 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Before RevFlow:</span>
                    <p className="text-sm font-bold text-slate-600">{t.ratingBefore} ★</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold">After ({t.timeframe}):</span>
                    <p className="text-base font-black text-emerald-600 font-['Space_Grotesk']">{t.ratingAfter} ★ ({t.reviewCount}+)</p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-slate-700 text-sm leading-relaxed italic mb-8 relative">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/50 shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{t.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </h4>
                  <p className="text-xs text-slate-500">{t.role} • {t.business}</p>
                  <p className="text-[10px] text-slate-400">{t.location}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
