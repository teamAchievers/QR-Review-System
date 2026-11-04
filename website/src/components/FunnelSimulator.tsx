import React, { useState } from 'react';
import { 
  Star, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  Send, 
  Sparkles, 
  Smartphone, 
  ExternalLink, 
  Copy, 
  RotateCcw,
  Zap,
  Bell,
  Heart,
  Store
} from 'lucide-react';

interface FunnelSimulatorProps {
  onOpenSubscribe: (planId?: string) => void;
}

export const FunnelSimulator: React.FC<FunnelSimulatorProps> = ({ onOpenSubscribe }) => {
  const [activeVenue, setActiveVenue] = useState<'dental' | 'pizza'>('dental');
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>(['Gentle dentist', 'Clean clinic', 'Pain-free cleaning']);
  const [privateFeedbackCategory, setPrivateFeedbackCategory] = useState<string>('Wait Time');
  const [privateFeedbackText, setPrivateFeedbackText] = useState<string>('Appointment started 20 minutes late, but treatment was fine.');
  const [customerContact, setCustomerContact] = useState<string>('patient@example.com');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copiedReview, setCopiedReview] = useState<boolean>(false);

  const venues = {
    dental: {
      name: 'Apex Dental Studio',
      slug: 'apex-dental',
      sub: 'Downtown Location • Chair #3',
      initial: 'A',
      color: 'from-blue-600 to-cyan-500',
      seoKeywords: 'emergency dentist, gentle teeth cleaning, modern dental clinic, root canal specialist',
      positiveChips: [
        'Gentle dentist',
        'Clean clinic',
        'Pain-free cleaning',
        'Friendly reception',
        'State-of-the-art tech'
      ],
      negativeCategories: [
        'Wait Time',
        'Billing / Insurance',
        'Pain Management',
        'Staff Demeanor',
        'Scheduling Confusion'
      ]
    },
    pizza: {
      name: 'Bella Napoli Pizzeria',
      slug: 'bella-napoli',
      sub: 'Main Street • Table #7',
      initial: 'B',
      color: 'from-red-600 to-amber-500',
      seoKeywords: 'authentic wood-fired pizza, handmade pasta, best italian restaurant, fresh burrata',
      positiveChips: [
        'Authentic wood-fired crust',
        'Fresh burrata',
        'Super fast service',
        'Cozy warm ambiance',
        'Best tiramisu in town'
      ],
      negativeCategories: [
        'Wait Time for Table',
        'Food Temperature',
        'Server Attentiveness',
        'Noisy Acoustics',
        'Bill Discrepancy'
      ]
    }
  };

  const current = venues[activeVenue];

  const handleVenueSwitch = (v: 'dental' | 'pizza') => {
    setActiveVenue(v);
    setSelectedChips(v === 'dental' ? ['Gentle dentist', 'Clean clinic'] : ['Authentic wood-fired crust', 'Super fast service']);
    setIsSubmitted(false);
    setCopiedReview(false);
  };

  const handleStarClick = (rating: number) => {
    setSelectedStars(rating);
    setIsSubmitted(false);
    setCopiedReview(false);
  };

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleSimulateSubmit = () => {
    setIsSubmitted(true);
    setCopiedReview(true);
  };

  const handleReset = () => {
    setSelectedStars(5);
    setIsSubmitted(false);
    setCopiedReview(false);
  };

  const isPositive = selectedStars >= 4;

  const generatedReviewText = `Exceptional experience at ${current.name}! ${selectedChips.join('. ')}. Easily the best in town. Highly recommended to anyone looking for quality!`;

  return (
    <section id="funnel-simulator" className="py-24 relative overflow-hidden bg-[#090e18]">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
        isPositive ? 'bg-blue-600/15' : 'bg-amber-600/15'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Live Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Space_Grotesk'] mb-4">
            Test the Dual-Routing Funnel in Real-Time
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            See exactly how SmartReview gates traffic: <strong className="text-emerald-400">4-5 Stars</strong> enrich SEO keywords and launch Google Reviews; <strong className="text-amber-400">1-3 Stars</strong> route directly to private internal management.
          </p>

          {/* Seeded Business Switcher */}
          <div className="mt-6 inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl">
            <button
              onClick={() => handleVenueSwitch('dental')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeVenue === 'dental' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Apex Dental Studio</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200">Dental</span>
            </button>
            <button
              onClick={() => handleVenueSwitch('pizza')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeVenue === 'pizza' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Bella Napoli Pizzeria</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-200">Restaurant</span>
            </button>
          </div>
        </div>

        {/* Rating Controller Bar */}
        <div className="max-w-xl mx-auto mb-12 p-3 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">Select Guest Rating:</span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoveredStars !== null ? hoveredStars : selectedStars) >= star;
              return (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStars(star)}
                  onMouseLeave={() => setHoveredStars(null)}
                  onClick={() => handleStarClick(star)}
                  className={`p-2 rounded-xl transition-all duration-200 cursor-pointer transform hover:scale-115 ${
                    active 
                      ? star >= 4 
                        ? 'text-amber-400 bg-amber-400/10' 
                        : 'text-amber-500 bg-amber-500/10'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                  aria-label={`${star} Stars`}
                >
                  <Star className={`w-7 h-7 ${active ? 'fill-current' : ''}`} />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* The Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Logic & Workflow Explanation */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Routing Status Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-500 ${
              isPositive 
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-500/5' 
                : 'bg-amber-950/20 border-amber-500/40 shadow-xl shadow-amber-500/5'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                  isPositive 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isPositive ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  {isPositive ? 'Google SEO Review Booster' : 'Private Complaint Shield Gate'}
                </span>
                <span className="text-xs text-slate-400 font-medium">{selectedStars} of 5 Stars</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
                {isPositive ? '1-Tap Clipboard Copy & Google Maps Redirect' : 'Intercepted: Saved in Private Client Inbox'}
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {isPositive 
                  ? `For ${current.name}, positive reviewers get their remarks enriched with high-value local SEO keywords (${current.seoKeywords.split(',').slice(0, 2).join(', ')}). The text is copied to clipboard and Google Maps review dialog opens in 1 tap.`
                  : 'Guests rating 1 to 3 stars submit directly into the business\'s private feedback inbox. The complaint never appears on Google Maps, and management can resolve the situation immediately.'}
              </p>

              {/* Direct Link to Real QR Page */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Live System Endpoint:</p>
                  <p className="text-xs text-cyan-300 font-mono">/r/{current.slug}</p>
                </div>
                <a
                  href={`http://localhost:3000/r/${current.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Open Real Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Behind-the-Scenes Manager Telemetry Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Business Client Inbox Log</h4>
              </div>

              {isPositive ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5">
                  <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    5-Star Review Redirected to Google Business Profile
                  </p>
                  <p className="text-slate-400">SEO Keywords Stuffed: "{current.seoKeywords.split(',').slice(0, 3).join(', ')}"</p>
                  <p className="text-[11px] text-cyan-300">✓ Customer clipboard updated & direct Google dialog opened.</p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 space-y-1.5">
                  <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Private Feedback Saved in Client Dashboard (/dashboard)
                  </p>
                  <p className="text-slate-400">Issue: {privateFeedbackCategory} • Guest: {customerContact}</p>
                  <p className="text-[11px] text-emerald-400">✓ Intercepted from Google Maps. Status: NEW in manager inbox.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Side: High-Fidelity Smartphone Mockup */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[420px] rounded-[44px] p-3.5 bg-gradient-to-b from-slate-600/40 via-slate-800/40 to-slate-900 border-4 border-slate-700/60 shadow-2xl shadow-black/80">
              
              {/* Phone Speaker & Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-10 h-1.5 bg-slate-700 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-2" />
              </div>

              {/* Phone Inner Display Screen */}
              <div className="rounded-[36px] bg-[#0c121e] border border-white/10 overflow-hidden min-h-[640px] flex flex-col justify-between relative text-slate-100 p-5 pt-10">
                
                {/* Header within Phone */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 px-1">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">5G</span>
                      <div className="w-4 h-2 rounded-sm border border-slate-400 p-[1px]">
                        <div className="h-full w-full bg-slate-300 rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Business Branding in App */}
                  <div className="text-center pb-4 border-b border-white/10">
                    <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white font-black text-xl shadow-lg mb-2`}>
                      {current.initial}
                    </div>
                    <h3 className="text-base font-extrabold text-white">{current.name}</h3>
                    <p className="text-xs text-slate-400">{current.sub}</p>
                  </div>
                </div>

                {/* Main Dynamic Funnel Content based on Stars */}
                <div className="my-auto py-3">
                  
                  {/* Star Rating Display */}
                  <div className="text-center mb-5">
                    <p className="text-xs font-semibold text-slate-300 mb-2">How was your visit today?</p>
                    <div className="flex justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStarClick(s)}
                          className="p-1 cursor-pointer"
                        >
                          <Star 
                            className={`w-7 h-7 transition-transform active:scale-125 ${
                              s <= selectedStars 
                                ? s >= 4 ? 'text-amber-400 fill-amber-400' : 'text-amber-500 fill-amber-500' 
                                : 'text-slate-600'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] font-bold mt-1.5 text-slate-400">
                      {selectedStars === 5 && '🌟 Outstanding! 5-star experience.'}
                      {selectedStars === 4 && '👍 Great! We are glad you enjoyed.'}
                      {selectedStars === 3 && '😐 Average. Let us know how to improve.'}
                      {selectedStars <= 2 && '🙁 Poor. We want to make it right.'}
                    </p>
                  </div>

                  {/* ROUTE A: 4 or 5 STARS (Google VIP Review) */}
                  {isPositive ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-blue-300 font-bold text-xs mb-1">
                          <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                          <span>Thank you so much!</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Would you mind taking 10 seconds to share your review on Google? Your review will be automatically copied!
                        </p>
                      </div>

                      {/* Compliment Chips */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Tap compliments to enrich:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {current.positiveChips.map((chip) => {
                            const isSelected = selectedChips.includes(chip);
                            return (
                              <button
                                key={chip}
                                onClick={() => toggleChip(chip)}
                                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600/40 border-blue-400 text-white font-medium'
                                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}{chip}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Auto-Drafted Review Preview Box */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 relative">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Generated Review (SEO Enriched):</p>
                        <p className="text-xs text-slate-200 italic leading-relaxed">
                          "{generatedReviewText}"
                        </p>
                      </div>

                      {/* Action Button: Copy & Post to Google */}
                      {!isSubmitted ? (
                        <button
                          onClick={handleSimulateSubmit}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy & Launch Google Reviews</span>
                        </button>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-fadeIn">
                          <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-white">Review Copied to Clipboard!</p>
                          <p className="text-[11px] text-emerald-300 mt-1">Google Reviews dialog opened in new tab. Simply paste and tap Post!</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ROUTE B: 1-3 STARS (Private Resolution Shield) */
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-left">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mb-1">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          <span>We sincerely apologize!</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Please let our management know what fell short so we can resolve it immediately.
                        </p>
                      </div>

                      {/* Category selector */}
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold mb-1.5">What can we improve?</p>
                        <div className="flex flex-wrap gap-1">
                          {current.negativeCategories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setPrivateFeedbackCategory(cat)}
                              className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                privateFeedbackCategory === cat
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                                  : 'bg-slate-900 border-white/10 text-slate-400'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Private Note input */}
                      <div>
                        <textarea
                          value={privateFeedbackText}
                          onChange={(e) => setPrivateFeedbackText(e.target.value)}
                          rows={2}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
                          placeholder="Tell us what happened..."
                        />
                      </div>

                      {/* Contact input */}
                      <div>
                        <input
                          type="text"
                          value={customerContact}
                          onChange={(e) => setCustomerContact(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-amber-400"
                          placeholder="Your email or phone (optional)"
                        />
                      </div>

                      {!isSubmitted ? (
                        <button
                          onClick={handleSimulateSubmit}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit to Private Manager Inbox</span>
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center animate-fadeIn">
                          <CheckCircle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-white">Received in Management Inbox</p>
                          <p className="text-[11px] text-slate-300 mt-1">Our manager is reviewing your message now. Thank you for giving us a chance to improve!</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer in Phone */}
                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span>Powered by SmartReview™ SaaS System</span>
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
