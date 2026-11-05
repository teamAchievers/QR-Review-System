export interface Plan {
  id: string;
  name: string;
  tier: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  monthlyPrice: number;
  annualPrice: number;
  annualTotal?: number;
  currency?: string;
  currencySymbol?: string;
  features: string[];
  standsIncluded: number;
  limits: string;
}

export const PRICING_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter Launch',
    tier: 'STARTER',
    tagline: 'Perfect for single location cafes, clinics, and studios',
    monthlyPrice: 350,
    annualPrice: 292,
    annualTotal: 3500,
    currency: 'INR',
    currencySymbol: '₹',
    limits: '1 Location • Unlimited Scans',
    standsIncluded: 1,
    features: [
      '1 Branded QR Code with your logo',
      'Unlimited Customer Scans',
      'Private Negative Feedback Shield',
      'Basic Keyword Weaving'
    ]
  },
  {
    id: 'growth',
    name: 'Growth Pro',
    tier: 'GROWTH',
    tagline: 'Best for fast-growing local businesses seeking 5-star Google dominance',
    badge: 'MOST POPULAR • BEST ROI',
    popular: true,
    monthlyPrice: 800,
    annualPrice: 417,
    annualTotal: 5000,
    currency: 'INR',
    currencySymbol: '₹',
    limits: 'Up to 3 Locations • Unlimited Scans',
    standsIncluded: 3,
    features: [
      'Everything in Starter',
      'AI Keyword Optimization (Gemini)',
      'Niche Highlight Pills & Smart Placeholders',
      'Multi-Variation Review Copying',
      '1 Free Premium Acrylic Standee Shipped',
      'Priority WhatsApp Support'
    ]
  },
  {
    id: 'pro',
    name: 'Enterprise Elite',
    tier: 'PRO',
    tagline: 'For multi-location chains, premium franchises, and agencies',
    monthlyPrice: 1500,
    annualPrice: 1000,
    annualTotal: 12000,
    currency: 'INR',
    currencySymbol: '₹',
    limits: 'Multi-Location Enterprise',
    standsIncluded: 5,
    features: [
      'Everything in Growth',
      'Up to 5 Custom Physical Standees Delivered',
      'Multi-Location Dashboard Access',
      'Monthly Local SEO & Reputation Audit',
      'Dedicated Account Manager',
      'Custom Domain White-Label Option'
    ]
  }
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  business: string;
  location: string;
  avatar: string;
  ratingBefore: number;
  ratingAfter: number;
  reviewCount: number;
  timeframe: string;
  quote: string;
  metric: string;
  slug?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Dr. Sarah Jenkins, DDS',
    role: 'Lead Dentist & Founder',
    business: 'Apex Dental Studio',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1594824813637-641571210874?w=150&auto=format&fit=crop&q=80',
    ratingBefore: 4.2,
    ratingAfter: 4.95,
    reviewCount: 382,
    timeframe: '60 days',
    quote: 'SmartReview transformed our dental clinic. When patients rate 5 stars, the keyword engine automatically suggests terms like "gentle emergency dentist" and "pain-free cleaning". Our Google rank jumped to #1 in downtown Austin!',
    metric: '+340% More 5-Star Reviews',
    slug: 'apex-dental'
  },
  {
    id: '2',
    name: 'Mario Rossi',
    role: 'Owner & Executive Pizzaiolo',
    business: 'Bella Napoli Pizzeria',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80',
    ratingBefore: 4.1,
    ratingAfter: 4.9,
    reviewCount: 520,
    timeframe: '90 days',
    quote: 'We place the QR stand on every dining table. A customer was unhappy about a wait time; instead of posting a 1-star review on Google, our manager got the alert in our private inbox and sent over complimentary gelato before they left.',
    metric: '94 Negative Reviews Shielded',
    slug: 'bella-napoli'
  },
  {
    id: '3',
    name: 'Marcus Vance',
    role: 'General Manager',
    business: 'Vance Auto Detailing & Ceramic',
    location: 'Phoenix, AZ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ratingBefore: 3.9,
    ratingAfter: 4.85,
    reviewCount: 295,
    timeframe: '45 days',
    quote: 'The 1-tap copy & Google redirect makes reviewing effortless. Our customers love that they do not need an app. The influx of authentic reviews generated $42,000 in new ceramic coating inquiries last month.',
    metric: '+$42k Monthly Revenue Lift'
  }
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: 'How does the Smart Review Gating system work?',
    answer: 'When a customer scans your QR code or taps the NFC stand, they see an intuitive 1 to 5-star rating interface. If they select 4 or 5 stars, they are instantly redirected to your Google Business Profile with AI-suggested review keywords automatically copied to their clipboard. If they select 1, 2, or 3 stars, they are seamlessly guided to a private internal feedback form that alerts your manager in real-time, allowing you to resolve issues privately before they ever harm your public Google score.'
  },
  {
    question: 'How does the SEO Keyword Weaving feature work?',
    answer: 'Google ranks local businesses largely based on the frequency of localized keywords in recent reviews (e.g., "emergency dental", "wood-fired pizza", "prompt staff"). When positive customers leave feedback, our built-in Gemini AI engine naturally incorporates your target business keywords into their review draft, making it effortless for the guest to copy and post with 1 tap.'
  },
  {
    question: 'Does this comply with Google\'s review policies?',
    answer: 'Yes! Our platform strictly follows Google\'s guidelines by never altering authentic feedback or forcing actions. We provide all customers a legitimate voice; positive reviewers are encouraged to share their public love, while dissatisfied guests receive a direct channel to company leadership for quick remedy.'
  },
  {
    question: 'Do customers need to download an application to scan?',
    answer: 'Absolutely not. Any smartphone (iPhone or Android) can scan the QR code using its standard native camera app or simply tap the stand using built-in NFC. It opens in less than 0.8 seconds in their default mobile browser without any login or download required.'
  },
  {
    question: 'Can we print our own table tents and counter standees?',
    answer: 'Yes! Your client dashboard includes a live Standee Studio where you can generate and print ready-to-use Table Tents and Counter Displays with 1 click using window.print(), or download high-resolution PNG & SVG vector files.'
  },
  {
    question: 'Can I cancel or change plans anytime?',
    answer: 'Yes. There are no lock-in contracts. If you ever decide it is not for you, you can cancel with 1 click in your dashboard anytime. Even if you cancel, you get to keep any delivered physical stands.'
  }
];

export const RECENT_ACTIVITY = [
  { business: 'Apex Dental Studio', rating: 5, site: 'Google Maps', time: '14s ago', city: 'Austin, TX' },
  { business: 'Bella Napoli Pizzeria', rating: 5, site: 'Google Maps', time: '38s ago', city: 'Chicago, IL' },
  { business: 'Luxe Salon & Spa', rating: 5, site: 'Google Maps', time: '1m ago', city: 'Miami, FL' },
  { business: 'Vance Auto Detailing', rating: 5, site: 'Google Maps', time: '2m ago', city: 'Phoenix, AZ' },
  { business: 'Highland Boutique Hotel', rating: 5, site: 'Google Maps', time: '3m ago', city: 'Denver, CO' }
];
