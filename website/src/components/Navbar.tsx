import React, { useState, useEffect } from 'react';
import { QrCode, Sparkles, Menu, X, ArrowRight, ShieldCheck, Zap, LogIn, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenSubscribe: (planId?: string) => void;
  onScrollTo: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSubscribe, onScrollTo }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            ? 'bg-[#080b11]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl shadow-black/40'
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
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-blue-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#080b11] animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#080b11]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-['Space_Grotesk']">
                    Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Review</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase -mt-0.5 font-medium">QR Gating & SEO Booster</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#111726]/70 border border-white/5 rounded-full px-4 py-1.5 backdrop-blur-md">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Right CTAs */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Client / Admin Login Link */}
              <a
                href="http://localhost:3000/login"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-white/10 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Portal Login</span>
              </a>

              {/* Start Free Trial Primary Button */}
              <button
                onClick={() => onOpenSubscribe('growth')}
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-semibold rounded-xl group bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-400 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer"
              >
                <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-[#090d16] group-hover:bg-opacity-0 rounded-[10px] flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <a
                href="http://localhost:3000/login"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-white/10"
              >
                Sign In
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-white/10"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0d1322] border-b border-white/10 px-4 pt-3 pb-6 mt-3 space-y-2 animate-fadeIn shadow-2xl">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 space-y-2">
              <a
                href="http://localhost:3000/login"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm font-medium"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                Sign In to Dashboard / Super Admin
              </a>
              <button
                onClick={() => {
                  onOpenSubscribe('growth');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
