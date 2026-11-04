import React from 'react';
import { QrCode, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenSubscribe: (planId?: string) => void;
  onScrollTo: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSubscribe, onScrollTo }) => {
  return (
    <footer className="bg-[#05070c] border-t border-white/10 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px]">
                <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-white font-['Space_Grotesk'] tracking-tight">
                Rev<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Flow</span> AI
              </span>
            </div>

            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              The high-converting QR review automation and reputation shield platform. Turn happy in-person customers into verified 5-star Google reviews on autopilot while privately shielding your business from negative feedback.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Review Funnels Operational (99.99%)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Industries</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-white transition-colors cursor-pointer">Restaurants & Cafes</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-white transition-colors cursor-pointer">Dental & Healthcare</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-white transition-colors cursor-pointer">Salons & Luxury Spas</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-white transition-colors cursor-pointer">Automotive Services</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-white transition-colors cursor-pointer">Hotels & Hospitality</button></li>
            </ul>
          </div>

          {/* Col 3: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product & Tools</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => onScrollTo('funnel-simulator')} className="hover:text-white transition-colors cursor-pointer">Live Scanner Simulator</button></li>
              <li><button onClick={() => onScrollTo('stand-customizer')} className="hover:text-white transition-colors cursor-pointer">3D Acrylic Stand Studio</button></li>
              <li><button onClick={() => onScrollTo('roi-calculator')} className="hover:text-white transition-colors cursor-pointer">ROI & Profit Calculator</button></li>
              <li><button onClick={() => onScrollTo('pricing')} className="hover:text-white transition-colors cursor-pointer">SaaS Pricing Plans</button></li>
              <li><button onClick={() => onScrollTo('faq')} className="hover:text-white transition-colors cursor-pointer">Google Policy Compliance</button></li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Security</h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <p className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Google Business Certified</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SOC-2 Type II Compliant</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>GDPR & CCPA Compliant</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Encrypted Webhooks</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} RevFlow AI Inc. All rights reserved. Built for high-growth businesses.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-slate-400 transition-colors">Security Whitepaper</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
