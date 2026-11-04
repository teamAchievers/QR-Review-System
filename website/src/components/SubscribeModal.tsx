import React, { useState } from 'react';
import { getPortalUrl } from '../config';
import { 
  X, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  QrCode, 
  Truck, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { PRICING_PLANS, Plan } from '../data/mockData';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
 
  isOpen, 
  onClose, 
  initialPlanId = 'growth' 
}) => {
  const portalUrl = getPortalUrl();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [step, setStep] = useState<number>(1); // 1: Plan, 2: Info, 3: Address & Google Place, 4: Success

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'Restaurant / Cafe',
    fullName: '',
    email: '',
    phone: '',
    googlePlaceUrl: '',
    shippingAddress: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card' // card or razorpay
  });

  if (!isOpen) return null;

  const activePlan = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[1];
  const price = isAnnual ? activePlan.annualPrice : activePlan.monthlyPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-white/15 shadow-2xl overflow-hidden my-8">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white font-['Space_Grotesk']">
                {step === 4 ? 'Subscription & Portal Activated!' : 'Subscribe to SmartReview SaaS'}
              </h3>
              <p className="text-[10px] text-slate-400">14-Day Free Trial • Instant QR Deployment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress dots */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-1 flex items-center justify-between border-b border-white/5 bg-slate-950/40">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
              <span className={step === 1 ? 'text-white' : 'text-slate-400'}>Choose Plan</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
              <span className={step === 2 ? 'text-white' : 'text-slate-400'}>Business Info</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
              <span className={step === 3 ? 'text-white' : 'text-slate-400'}>Standee & Trial</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: PLAN SELECTOR */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">Select Your Growth Plan</h4>
                  <p className="text-xs text-slate-400">All plans start with a 14-day free trial.</p>
                </div>

                {/* Annual toggle mini */}
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-bold">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-3 py-1 rounded-lg ${!isAnnual ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 ${isAnnual ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'text-slate-400'}`}
                  >
                    <span>Annual</span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-400 text-black rounded font-black">-20%</span>
                  </button>
                </div>
              </div>

              {/* Plans Radio Cards */}
              <div className="space-y-3">
                {PRICING_PLANS.map((plan) => {
                  const pPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-blue-950/40 border-blue-400 shadow-lg shadow-blue-500/10' 
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-500'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{plan.name}</span>
                            {plan.popular && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-400 text-slate-950">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{plan.limits} • {plan.standsIncluded} Free Stand{plan.standsIncluded > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-white font-['Space_Grotesk']">${pPrice}</span>
                        <span className="text-xs text-slate-400"> /mo</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Free Express Stand Delivery Included with {activePlan.name}</span>
                </div>
                <span className="text-emerald-400 font-bold">$0 Charged Today</span>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS & CONTACT INFO */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">Your Business Information</h4>
                <p className="text-xs text-slate-400">This provisions your client profile and private inbox.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    placeholder="e.g. Apex Dental Studio"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Industry / Category
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  >
                    <option>Dental / Healthcare Practice</option>
                    <option>Restaurant / Cafe / Bar</option>
                    <option>Salon / Spa / Wellness</option>
                    <option>Auto Detailing / Repair</option>
                    <option>Hotel / Hospitality</option>
                    <option>Retail & Boutique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Owner / Manager Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Admin Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="sarah@apexdental.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone for Instant Feedback SMS Alert
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(555) 234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STAND SHIPPING & GOOGLE CONNECT */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">Hardware Shipping & Google Connect</h4>
                <p className="text-xs text-slate-400">Where should we mail your {activePlan.standsIncluded} custom acrylic NFC stands?</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Google Business Profile Link or Review URL
                  </label>
                  <input
                    type="text"
                    name="googlePlaceUrl"
                    placeholder="https://g.page/r/... or business search address"
                    value={formData.googlePlaceUrl}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Physical Delivery Address
                  </label>
                  <input
                    type="text"
                    name="shippingAddress"
                    placeholder="123 Main Street, Suite 400"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      City & State
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Austin, TX"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Postal Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="78701"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* 14-Day Free Trial Guarantee Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-blue-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      14-Day Free Trial Active
                    </span>
                    <span className="text-emerald-400 font-extrabold">$0.00 DUE TODAY</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    You won’t be charged until 14 days from now (${price}/mo thereafter). Your custom stands will ship immediately via FedEx Priority. Keep the stands even if you cancel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS & CELEBRATION */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Provisioned Successfully</span>
                <h4 className="text-2xl font-black text-white font-['Space_Grotesk'] mt-1">
                  Welcome to SmartReview SaaS!
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-2">
                  Your 14-day free trial for <strong className="text-white">{activePlan.name}</strong> is live. Your live QR review funnel has been generated!
                </p>
              </div>

              {/* Instant Digital QR Code Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 max-w-xs mx-auto text-center shadow-2xl">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Public QR Link:</p>
                <div className="w-36 h-36 mx-auto bg-white rounded-xl p-2.5 flex items-center justify-center shadow-lg relative">
                  <QrCode className="w-32 h-32 text-slate-900" />
                  <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-blue-600 border border-white flex items-center justify-center text-white text-xs font-bold">
                    ★
                  </div>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium mt-2">
                  ✓ Active URL: smartreview.io/r/{formData.businessName ? encodeURIComponent(formData.businessName.toLowerCase().replace(/\s+/g, '-')) : 'apex-dental'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`${portalUrl}/login`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Launch Dashboard Login</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Close & Explore Site
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">Step 1 of 3</span>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>{step === 3 ? 'Activate Free 14-Day Trial' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
