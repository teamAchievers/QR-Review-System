import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FunnelSimulator } from './components/FunnelSimulator';
import { HowItWorks } from './components/HowItWorks';
import { StandCustomizer } from './components/StandCustomizer';
import { RoiCalculator } from './components/RoiCalculator';
import { FeaturesGrid } from './components/FeaturesGrid';
import { PricingSection } from './components/PricingSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { SubscribeModal } from './components/SubscribeModal';
import { Sparkles, ArrowRight, QrCode } from 'lucide-react';

export function App() {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('growth');

  const handleOpenSubscribe = (planId?: string) => {
    if (planId) {
      setSelectedPlanId(planId);
    }
    setSubscribeModalOpen(true);
  };

  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Floating Notification Strip */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-2 px-4 text-center text-xs font-semibold text-white flex items-center justify-center gap-2 relative z-50 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Spring Growth Offer: Get 3 Free Custom Engraved Acrylic Stands with your 14-Day Free Trial</span>
        <button
          onClick={() => handleOpenSubscribe('growth')}
          className="underline font-bold text-amber-200 hover:text-white cursor-pointer ml-1 inline-flex items-center gap-1 transition-colors"
        >
          Claim Stands <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Navigation */}
      <Navbar onOpenSubscribe={handleOpenSubscribe} onScrollTo={handleScrollTo} />

      {/* Hero Section */}
      <main className="flex-grow">
        <Hero onOpenSubscribe={handleOpenSubscribe} onScrollTo={handleScrollTo} />

        {/* Live Interactive Funnel Simulator */}
        <FunnelSimulator onOpenSubscribe={handleOpenSubscribe} />

        {/* How It Works 3-Step Pipeline */}
        <HowItWorks onOpenSubscribe={handleOpenSubscribe} onScrollTo={handleScrollTo} />

        {/* Stand Customizer 3D Studio */}
        <StandCustomizer onOpenSubscribe={handleOpenSubscribe} />

        {/* Dynamic ROI & Profit Calculator */}
        <RoiCalculator onOpenSubscribe={handleOpenSubscribe} />

        {/* Comprehensive Enterprise Features Grid */}
        <FeaturesGrid />

        {/* Pricing Tiers & Subscription CTA */}
        <PricingSection onOpenSubscribe={handleOpenSubscribe} />

        {/* Customer Social Proof & Testimonials */}
        <TestimonialsSection />

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* Pre-Footer Action Banner */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-500/5">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mb-6">
              Start Collecting 5-Star Reviews Today
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal">
              Join 12,000+ top-rated restaurants, clinics, and service businesses. Protect your reputation with the Smart Review Shield.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleOpenSubscribe('growth')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScrollTo('funnel-simulator')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-xs transition-colors cursor-pointer"
              >
                Test Interactive Funnel
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-5 font-medium">
              14-Day Free Trial • No Contract • Free Custom Acrylic Stands Included
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer onOpenSubscribe={handleOpenSubscribe} onScrollTo={handleScrollTo} />

      {/* Subscribe & Signup Modal */}
      <SubscribeModal
        isOpen={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        initialPlanId={selectedPlanId}
      />
    </div>
  );
}

export default App;
