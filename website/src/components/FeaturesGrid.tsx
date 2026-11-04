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
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400'
    },
    {
      icon: Bot,
      title: 'AI Review Auto-Replier',
      badge: 'Automation',
      description: 'Replies to every Google review in under 3 minutes with tailored, SEO-optimized responses that enhance local ranking.',
      color: 'from-indigo-500/20 to-cyan-500/10 text-cyan-300'
    },
    {
      icon: Smartphone,
      title: 'Dual NFC + Dynamic QR',
      badge: 'Hardware',
      description: 'Zero app required. Customers simply touch their phone to the stand or point their camera. Fast load in < 0.8 seconds.',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400'
    },
    {
      icon: Users,
      title: 'Staff Attribution & Leaderboard',
      badge: 'Team Incentive',
      description: 'Assign unique QR codes to individual servers or dental assistants. Gamify review collection with bonuses and tips.',
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400'
    },
    {
      icon: Building2,
      title: 'Multi-Location Command Center',
      badge: 'Franchise',
      description: 'Manage 1 to 50+ branches from a single unified executive screen. Compare location scores, volume, and manager response times.',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400'
    },
    {
      icon: Layers,
      title: 'POS & Webhook Integrations',
      badge: 'Ecosystem',
      description: 'Sync effortlessly with Toast, Square, Clover, Lightspeed, and Stripe to trigger automated SMS follow-ups upon receipt closure.',
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400'
    },
    {
      icon: FileCheck2,
      title: 'Fake Review Removal Assistant',
      badge: 'AI Protection',
      description: 'Detects defamatory or fake competitor reviews and automatically formats formal policy violation dispute filings for Google.',
      color: 'from-amber-500/20 to-yellow-500/10 text-yellow-400'
    },
    {
      icon: Gift,
      title: 'Instant Loyalty Incentives',
      badge: 'Retention',
      description: 'Reward happy guests with discount coupons, free appetizers, or raffle tickets displayed immediately upon positive review verification.',
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-300'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#090e18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>Enterprise-Grade Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Space_Grotesk'] mb-4">
            Everything Built to Dominate Local Reputation
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
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
                className="p-6 rounded-2xl bg-gradient-to-b from-[#111827] to-[#0a0e17] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 font-['Space_Grotesk']">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
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
