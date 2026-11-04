import React from 'react';
import { QrCode, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenSubscribe: (planId?: string) => void;
  onScrollTo: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSubscribe, onScrollTo }) => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px] shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-slate-900 font-['Space_Grotesk'] tracking-tight">
                Rev<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Flow</span> AI
              </span>
            </div>

            <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
              The high-converting QR review automation and reputation shield platform. Turn happy in-person customers into verified 5-star Google reviews on autopilot while privately shielding your business from negative feedback.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Review Funnels Operational (99.99%)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Industries</h4>
            <ul className="space-y-2 text-slate-600">
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-slate-900 transition-colors cursor-pointer">Restaurants & Cafes</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-slate-900 transition-colors cursor-pointer">Dental & Healthcare</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-slate-900 transition-colors cursor-pointer">Salons & Luxury Spas</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-slate-900 transition-colors cursor-pointer">Automotive Services</button></li>
              <li><button onClick={() => onScrollTo('how-it-works')} className="hover:text-slate-900 transition-colors cursor-pointer">Hotels & Hospitality</button></li>
            </ul>
          </div>

          {/* Col 3: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Product & Tools</h4>
            <ul className="space-y-2 text-slate-600">
              <li><button onClick={() => onScrollTo('funnel-simulator')} className="hover:text-slate-900 transition-colors cursor-pointer">Live Scanner Simulator</button></li>
              <li><button onClick={() => onScrollTo('stand-customizer')} className="hover:text-slate-900 transition-colors cursor-pointer">3D Acrylic Stand Studio</button></li>
              <li><button onClick={() => onScrollTo('roi-calculator')} className="hover:text-slate-900 transition-colors cursor-pointer">ROI & Profit Calculator</button></li>
              <li><button onClick={() => onScrollTo('pricing')} className="hover:text-slate-900 transition-colors cursor-pointer">SaaS Pricing Plans</button></li>
              <li><button onClick={() => onScrollTo('faq')} className="hover:text-slate-900 transition-colors cursor-pointer">Google Policy Compliance</button></li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Trust & Security</h4>
            <div className="space-y-2 text-slate-600 text-xs">
              <p className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Google Business Certified</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SOC-2 Type II Compliant</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GDPR & CCPA Compliant</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit Encrypted Webhooks</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} RevFlow AI Inc. All rights reserved. Built for high-growth businesses.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-slate-800 transition-colors">Security Whitepaper</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
