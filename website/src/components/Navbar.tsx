import React, { useState, useEffect } from 'react';
import { QrCode, Sparkles, Menu, X, ArrowRight, ShieldCheck, Zap, LogIn } from 'lucide-react';
import { getPortalUrl } from '../config';

interface NavbarProps {
  onOpenSubscribe: (planId?: string) => void;
  onScrollTo: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSubscribe, onScrollTo }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const portalUrl = getPortalUrl();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Live Simulator', id: 'funnel-simulator' },
    { name: 'Standee Studio', id: 'stand-customizer' },
    { name: 'ROI Calculator', id: 'roi-calculator' },
    { name: 'Pricing Plans', id: 'pricing' },
    { name: 'FAQ', id: 'faq' },
  ];

  const handleLinkClick = (id: string) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-xs'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-[2px] shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-blue-600 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 font-['Space_Grotesk']">
                    Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Review</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 tracking-wider uppercase -mt-0.5 font-semibold">QR Gating & SEO Booster</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 border border-slate-200/80 rounded-full px-3 py-1.5 backdrop-blur-md shadow-xs">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950 rounded-full hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Right CTAs */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Client / Admin Login Link */}
              <a
                href={`${portalUrl}/login`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Portal Login</span>
              </a>

              {/* Start Free Trial Primary Button */}
              <button
                onClick={() => onOpenSubscribe('growth')}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <a
                href={`${portalUrl}/login`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
              >
                Sign In
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 mt-3 space-y-2 animate-fadeIn shadow-xl">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <a
                href={`${portalUrl}/login`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-sm font-bold border border-slate-200"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                Sign In to Dashboard / Super Admin
              </a>
              <button
                onClick={() => {
                  onOpenSubscribe('growth');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/25"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
