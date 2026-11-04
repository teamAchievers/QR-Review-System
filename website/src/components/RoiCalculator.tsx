import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Star, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface RoiCalculatorProps {
  onOpenSubscribe: (planId?: string) => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenSubscribe }) => {
  const [monthlyGuests, setMonthlyGuests] = useState<number>(1500);
  const [currentRating, setCurrentRating] = useState<number>(4.1);
  const [averageTicket, setAverageTicket] = useState<number>(55);

  // Dynamic calculations based on real hospitality & service industry benchmarks
  // Typically 14-18% of customers scan/tap an in-venue stand
  const scanRate = 0.16;
  const totalScans = Math.round(monthlyGuests * scanRate);
  
  // ~88% of scanned reviews are 4-5 stars when actively invited
  const new5StarReviews = Math.round(totalScans * 0.88);
  
  // ~12% are 1-3 stars which get shielded privately
  const negativeReviewsDeflected = Math.round(totalScans * 0.12);

  // Projected rating boost (capped at 4.95)
  const projectedRating = Math.min(4.95, Number((currentRating + 0.65).toFixed(1)));

  // Harvard Business School study: 1-star increase in Yelp/Google rating leads to a 5-9% increase in business revenue
  // We estimate a conservative 7% lift on total gross revenue
  const currentGross = monthlyGuests * averageTicket;
  const estimatedRevenueLift = Math.round(currentGross * 0.075);

  // ROI comparing to the Growth Plan ($79/mo)
  const growthPlanCost = 79;
  const roiMultiplier = Math.round((estimatedRevenueLift - growthPlanCost) / growthPlanCost);

  return (
    <section id="roi-calculator" className="py-24 relative overflow-hidden bg-[#080b11]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Profit Estimator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Space_Grotesk'] mb-4">
            Calculate Your Revenue Impact
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            According to Harvard Business School research, each 1-star increase on Google/Yelp generates 5–9% more customer revenue. Calculate your potential return below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sliders Input Column */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-8">
            
            {/* Slider 1: Monthly Guests */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Monthly In-Person Guests / Customers
                </label>
                <span className="text-lg font-black text-white font-['Space_Grotesk']">
                  {monthlyGuests.toLocaleString()} <span className="text-xs text-slate-400 font-normal">guests/mo</span>
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="8000"
                step="100"
                value={monthlyGuests}
                onChange={(e) => setMonthlyGuests(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                <span>300 / mo</span>
                <span>4,000 / mo</span>
                <span>8,000+ / mo</span>
              </div>
            </div>

            {/* Slider 2: Current Google Rating */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Current Google Star Rating
                </label>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-black text-amber-300 font-['Space_Grotesk']">
                    {currentRating.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="3.0"
                max="4.8"
                step="0.1"
                value={currentRating}
                onChange={(e) => setCurrentRating(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                <span>3.0 (At risk)</span>
                <span>4.0 (Average)</span>
                <span>4.8 (High)</span>
              </div>
            </div>

            {/* Slider 3: Average Order Value */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Average Customer Spend / Ticket Size
                </label>
                <span className="text-lg font-black text-emerald-400 font-['Space_Grotesk']">
                  ${averageTicket} <span className="text-xs text-slate-400 font-normal">per visit</span>
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="250"
                step="5"
                value={averageTicket}
                onChange={(e) => setAverageTicket(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                <span>$15 (Coffee/Fast Casual)</span>
                <span>$100 (Dining/Salon)</span>
                <span>$250+ (Medical/Auto)</span>
              </div>
            </div>

            {/* Footnote */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-slate-400 leading-relaxed">
              💡 <strong>Model Assumptions:</strong> 16% in-venue scan rate, 88% positive conversion with AI review suggestion prompts, 7.5% gross sales lift from top 3 Google Local Pack positioning.
            </div>

          </div>

          {/* Result Output Column */}
          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#121a2f] via-[#0f172a] to-[#0a0f1d] border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">Your Projected 90-Day Gains</span>
                  <h3 className="text-2xl font-black text-white font-['Space_Grotesk']">Estimated Performance Lift</h3>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{roiMultiplier}x ROI</span>
                </div>
              </div>

              {/* Big Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                
                {/* Metric 1 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5">
                  <p className="text-xs text-slate-400 mb-1">New 5★ Google Reviews</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-300 font-['Space_Grotesk']">
                    +{new5StarReviews}
                    <span className="text-xs text-slate-400 font-normal"> / month</span>
                  </p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-1">~{new5StarReviews * 3} in 90 days</p>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5">
                  <p className="text-xs text-slate-400 mb-1">Bad Reviews Intercepted</p>
                  <p className="text-2xl sm:text-3xl font-black text-cyan-300 font-['Space_Grotesk']">
                    {negativeReviewsDeflected}
                    <span className="text-xs text-slate-400 font-normal"> / month</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Resolved privately via SMS</p>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5">
                  <p className="text-xs text-slate-400 mb-1">Projected Google Rating</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg line-through text-slate-500">{currentRating.toFixed(1)}★</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Space_Grotesk']">
                      {projectedRating.toFixed(1)}★
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-medium mt-1">Local Top 3 ranking boost</p>
                </div>

                {/* Metric 4 */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-emerald-900/30 border border-emerald-500/30">
                  <p className="text-xs text-emerald-300 mb-1">Est. Monthly Revenue Gain</p>
                  <p className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
                    +${estimatedRevenueLift.toLocaleString()}
                    <span className="text-xs text-emerald-300 font-normal"> / mo</span>
                  </p>
                  <p className="text-[10px] text-emerald-300 font-medium mt-1">+${(estimatedRevenueLift * 12).toLocaleString()} / year</p>
                </div>

              </div>

              {/* Call to Action */}
              <button
                onClick={() => onOpenSubscribe('growth')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Unlock +${estimatedRevenueLift.toLocaleString()}/mo with Growth Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
