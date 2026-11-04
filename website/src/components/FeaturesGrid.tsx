import React from 'react';
import { 
  ShieldCheck, 
  Bot, 
  Smartphone, 
  Users, 
  Building2, 
  Layers, 
  Award, 
  Zap, 
  TrendingUp, 
  MessageCircle, 
  FileCheck2, 
  Gift 
} from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Proprietary Review Shield',
      badge: 'Defensive',
      description: 'Filters 1-3 star reviews into private manager resolution before they can damage your public Google or Yelp rating.',
      color: 'from-amber-100 to-amber-50 text-amber-600 border-amber-200'
    },
    {
      icon: Bot,
      title: 'AI Review Auto-Replier',
      badge: 'Automation',
      description: 'Replies to every Google review in under 3 minutes with tailored, SEO-optimized responses that enhance local ranking.',
      color: 'from-blue-100 to-indigo-50 text-blue-600 border-blue-200'
    },
    {
      icon: Smartphone,
      title: 'Dual NFC + Dynamic QR',
      badge: 'Hardware',
      description: 'Zero app required. Customers simply touch their phone to the stand or point their camera. Fast load in < 0.8 seconds.',
      color: 'from-emerald-100 to-teal-50 text-emerald-600 border-emerald-200'
    },
    {
      icon: Users,
      title: 'Staff Attribution & Leaderboard',
      badge: 'Team Incentive',
      description: 'Assign unique QR codes to individual servers or dental assistants. Gamify review collection with bonuses and tips.',
      color: 'from-purple-100 to-indigo-50 text-purple-600 border-purple-200'
    },
    {
      icon: Building2,
      title: 'Multi-Location Command Center',
      badge: 'Franchise',
      description: 'Manage 1 to 50+ branches from a single unified executive screen. Compare location scores, volume, and manager response times.',
      color: 'from-sky-100 to-blue-50 text-sky-600 border-sky-200'
    },
    {
      icon: Layers,
      title: 'POS & Webhook Integrations',
      badge: 'Ecosystem',
      description: 'Sync effortlessly with Toast, Square, Clover, Lightspeed, and Stripe to trigger automated SMS follow-ups upon receipt closure.',
      color: 'from-rose-100 to-pink-50 text-rose-600 border-rose-200'
    },
    {
      icon: FileCheck2,
      title: 'Fake Review Removal Assistant',
      badge: 'AI Protection',
      description: 'Detects defamatory or fake competitor reviews and automatically formats formal policy violation dispute filings for Google.',
      color: 'from-amber-100 to-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      icon: Gift,
      title: 'Instant Loyalty Incentives',
      badge: 'Retention',
      description: 'Reward happy guests with discount coupons, free appetizers, or raffle tickets displayed immediately upon positive review verification.',
      color: 'from-teal-100 to-cyan-50 text-teal-600 border-teal-200'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Enterprise-Grade Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mb-4">
            Everything Built to Dominate Local Reputation
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Purpose-built automation designed from the ground up for brick-and-mortar operators who refuse to let negative reviews hurt their bottom line.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center border shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-xs">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 font-['Space_Grotesk']">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
