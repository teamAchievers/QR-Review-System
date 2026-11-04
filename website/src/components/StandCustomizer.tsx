import React, { useState } from 'react';
import { 
  Palette, 
  QrCode, 
  Smartphone, 
  Check, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';

interface StandCustomizerProps {
  onOpenSubscribe: (planId?: string) => void;
}

export const StandCustomizer: React.FC<StandCustomizerProps> = ({ onOpenSubscribe }) => {
  const [businessName, setBusinessName] = useState('Apex Dental Studio');
  const [subtitle, setSubtitle] = useState('Chair #3 • Tap or Scan to Review');
  const [accentColor, setAccentColor] = useState('#2563eb'); // Blue
  const [material, setMaterial] = useState<'obsidian' | 'crystal' | 'gold' | 'wood'>('crystal');
  const [platform, setPlatform] = useState<'google' | 'yelp' | 'tripadvisor'>('google');

  const materials = [
    { id: 'crystal', name: 'Frosted Crystal', desc: 'Sleek frosted lucite acrylic' },
    { id: 'obsidian', name: 'Matte Obsidian', desc: 'Ultra-dark scratchproof acrylic' },
    { id: 'gold', name: 'Brushed Brass', desc: 'Champagne metallic luxury' },
    { id: 'wood', name: 'Walnut Eco', desc: 'Sustainable solid American walnut' },
  ];

  const colorOptions = [
    { name: 'Royal Blue', hex: '#2563eb' },
    { name: 'Emerald Mint', hex: '#10b981' },
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Indigo Pulse', hex: '#6366f1' },
    { name: 'Rose Red', hex: '#f43f5e' },
  ];

  const getStandBackground = () => {
    switch (material) {
      case 'crystal':
        return 'bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 border-slate-300 shadow-2xl';
      case 'obsidian':
        return 'bg-gradient-to-b from-slate-900 via-[#111827] to-[#070b13] text-white border-slate-700 shadow-2xl';
      case 'gold':
        return 'bg-gradient-to-b from-[#f3e5b8] via-[#e2c17b] to-[#b38938] text-slate-950 border-amber-300 shadow-2xl';
      case 'wood':
        return 'bg-gradient-to-b from-[#5c3a21] via-[#432818] to-[#2b170c] text-amber-50 border-amber-900 shadow-2xl';
    }
  };

  const isLightMaterial = material === 'crystal' || material === 'gold';

  return (
    <section id="stand-customizer" className="py-24 relative overflow-hidden bg-slate-50/70 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Palette className="w-3.5 h-3.5" />
            <span>Interactive Hardware Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight font-['Space_Grotesk'] mb-4">
            Customize Your Physical Smart QR Stands
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Every subscription includes custom laser-engraved NFC + QR stands matched to your brand aesthetics. Preview your physical stands in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
              
              {/* Business Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Business Name on Stand
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="e.g. Apex Dental Studio"
                />
              </div>

              {/* Call-to-action Subtitle Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Call to Action / Incentive Banner
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  placeholder="e.g. Scan to Rate & Win 10% Off"
                />
              </div>

              {/* Material Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Select Stand Material & Finish
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {materials.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => setMaterial(mat.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        material === mat.id
                          ? 'bg-blue-50/80 border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{mat.name}</span>
                        {material === mat.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{mat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Brand Accent Highlight
                </label>
                <div className="flex items-center gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setAccentColor(c.hex)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform cursor-pointer shadow-xs ${
                        accentColor === c.hex ? 'scale-115 ring-2 ring-slate-900 ring-offset-2' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {accentColor === c.hex && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Destination */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Primary 5-Star Target Ecosystem
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'google', name: 'Google Maps' },
                    { id: 'yelp', name: 'Yelp' },
                    { id: 'tripadvisor', name: 'TripAdvisor' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        platform === p.id 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Stand CTA */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenSubscribe('growth')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Order 3 Free Custom Stands With Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                  Included at no extra charge in Growth & Enterprise plans • Ships in 48 hours
                </p>
              </div>

            </div>
          </div>

          {/* Stand 3D Mockup Column */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            {/* The 3D Perspective Stand Assembly */}
            <div className="relative w-full max-w-sm flex flex-col items-center animate-float-slow">
              
              {/* Stand Body Plaque */}
              <div 
                className={`w-72 sm:w-80 rounded-3xl p-6 border-2 shadow-2xl transition-all duration-500 relative flex flex-col items-center justify-between min-h-[380px] ${getStandBackground()}`}
              >
                {/* Top Subtle Hardware Screws */}
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${isLightMaterial ? 'bg-slate-200/80 text-slate-800' : 'bg-black/40 text-white'}`}>
                    <Smartphone className="w-3 h-3" />
                    <span>NTAG213 NFC Active</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
                </div>

                {/* Business Header on Stand */}
                <div className="text-center w-full px-2">
                  <h3 className="text-lg font-black tracking-tight uppercase line-clamp-1">
                    {businessName || 'Your Business Name'}
                  </h3>
                  <div className="flex justify-center text-amber-500 text-sm my-1">
                    {'★★★★★'}
                  </div>
                  <p className="text-[10px] font-bold opacity-80 line-clamp-1">
                    {subtitle || 'Rate Your Experience'}
                  </p>
                </div>

                {/* Vector QR Code Square on Stand */}
                <div 
                  className="w-40 h-40 rounded-2xl p-3 shadow-md flex items-center justify-center relative my-3 transition-colors duration-300 bg-white"
                  style={{ border: `2px solid ${accentColor}40` }}
                >
                  <QrCode 
                    className="w-32 h-32 transition-colors duration-300 text-slate-900" 
                  />
                  {/* Center Brand Badge inside QR */}
                  <div 
                    className="absolute inset-0 m-auto w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border-2 border-white text-white font-black text-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    ★
                  </div>
                </div>

                {/* Bottom Instruction Strip */}
                <div className="text-center w-full pt-1">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm ${isLightMaterial ? 'bg-slate-200/80 text-slate-800' : 'bg-black/30 text-white'}`}>
                    <span>TAP WITH PHONE OR SCAN</span>
                  </div>
                  <p className="text-[9px] opacity-80 mt-1 font-semibold">
                    Target: {platform === 'google' ? 'Google Maps' : platform === 'yelp' ? 'Yelp' : 'TripAdvisor'}
                  </p>
                </div>
              </div>

              {/* Stand Solid Acrylic / Metal Weighted Footing */}
              <div 
                className={`w-88 sm:w-96 h-5 rounded-full shadow-md mt-1 border-t border-slate-200 transition-all duration-500 ${
                  material === 'gold' 
                    ? 'bg-gradient-to-r from-[#b38938] via-[#f7e099] to-[#b38938]' 
                    : material === 'crystal'
                    ? 'bg-gradient-to-r from-slate-200 via-white to-slate-200'
                    : material === 'wood'
                    ? 'bg-[#3b2012]'
                    : 'bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800'
                }`}
              />
              <div className="w-72 h-3 bg-slate-400/30 rounded-full blur-xs -mt-1" />

              {/* Specifications Pills */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Heavyweight 6mm Acrylic
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Scratch-Proof Matte UV
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  No Battery Needed (NFC)
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
