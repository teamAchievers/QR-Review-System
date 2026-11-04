export interface NicheConfig {
  id: string;
  name: string;
  categoryAliases: string[];
  quickTags: string[];
  placeholder: string;
  defaultKeywords: string;
}

export const NICHE_CONFIGS: NicheConfig[] = [
  {
    id: "restaurant",
    name: "Restaurant & Cafe / Food & Dining",
    categoryAliases: ["restaurant", "cafe", "food", "dining", "bar", "bakery", "pizzeria", "bistro", "pub", "coffee"],
    quickTags: [
      "Delicious Food & Flavors",
      "Attentive & Quick Service",
      "Warm & Cozy Atmosphere",
      "Fresh, High-Quality Ingredients",
      "Great Drinks & Cocktails",
      "Spotless & Hygienic Dining",
      "Generous Portions",
      "Fair & Transparent Pricing",
    ],
    placeholder: "Tell us what you loved (e.g. loved the food, cocktails, attentive staff, great ambiance)...",
    defaultKeywords: "delicious food, friendly service, fresh ingredients, authentic cuisine, great atmosphere, top rated restaurant",
  },
  {
    id: "dental",
    name: "Dental Clinic & Orthodontics",
    categoryAliases: ["dental", "dentist", "orthodontist", "teeth", "oral care"],
    quickTags: [
      "Gentle & Painless Treatment",
      "Professional & Caring Doctors",
      "Spotless & Modern Clinic",
      "Zero Wait Time & On Schedule",
      "Friendly & Reassuring Staff",
      "Clear Treatment Explanation",
      "Comfortable Environment",
      "Fair & Transparent Pricing",
    ],
    placeholder: "Tell us what you loved (e.g. painless treatment, friendly dentists, clean modern clinic)...",
    defaultKeywords: "gentle dentistry, painless cleaning, modern dental clinic, Invisalign, professional dentist, friendly staff",
  },
  {
    id: "medical",
    name: "Healthcare, Hospital & Clinic",
    categoryAliases: ["medical", "clinic", "doctor", "healthcare", "pediatric", "physiotherapy", "dermatology", "chiropractic"],
    quickTags: [
      "Thorough & Caring Consultation",
      "Empathetic Doctors & Nurses",
      "Clean & Sanitized Facility",
      "Minimal Waiting Time",
      "Clear Diagnosis & Advice",
      "Helpful & Courteous Staff",
      "Compassionate Patient Care",
      "Smooth Appointment Process",
    ],
    placeholder: "Tell us what you loved (e.g. compassionate care, thorough consultation, helpful nurses)...",
    defaultKeywords: "compassionate doctor, professional healthcare, thorough diagnosis, modern clinic, kind medical staff",
  },
  {
    id: "spa_salon",
    name: "Salon, Spa & Beauty / Wellness",
    categoryAliases: ["spa", "salon", "beauty", "massage", "hair", "nails", "wellness", "skincare", "barbershop", "day spa"],
    quickTags: [
      "Relaxing & Serene Atmosphere",
      "Skilled Therapists & Stylists",
      "Rejuvenating Treatment",
      "Impeccable Cleanliness",
      "Soothing Music & Aromas",
      "Friendly & Polite Staff",
      "Premium Quality Products",
      "Great Value & Pampering",
    ],
    placeholder: "Tell us what you loved (e.g. relaxing massage, talented stylists, serene peaceful vibe)...",
    defaultKeywords: "relaxing massage, skilled hair stylists, rejuvenating facial, clean luxurious spa, best salon experience",
  },
  {
    id: "automotive",
    name: "Automotive, Car Repair & Detailing",
    categoryAliases: ["auto", "automotive", "car", "mechanic", "garage", "repair", "detailing", "oil change", "tires"],
    quickTags: [
      "Honest & Transparent Advice",
      "Fast & Timely Turnaround",
      "Fair & Clear Estimates",
      "Expert Mechanics & Knowledge",
      "Clean & Comfortable Lounge",
      "High-Quality Workmanship",
      "No Hidden Charges",
      "Friendly & Helpful Team",
    ],
    placeholder: "Tell us what you loved (e.g. honest diagnosis, fast turnaround, fair pricing, smooth drive)...",
    defaultKeywords: "honest mechanic, reliable car repair, fast turnaround, fair transparent pricing, quality auto service",
  },
  {
    id: "fitness",
    name: "Gym, Fitness & Yoga Studio",
    categoryAliases: ["gym", "fitness", "workout", "crossfit", "yoga", "pilates", "training", "personal training"],
    quickTags: [
      "Top-Notch Equipment & Weights",
      "Supportive & Knowledgeable Trainers",
      "Clean, Spacious & Sanitized",
      "High Energy & Great Music",
      "Welcoming & Friendly Community",
      "Varied & Fun Group Classes",
      "Great Value Memberships",
      "Motivating Atmosphere",
    ],
    placeholder: "Tell us what you loved (e.g. great equipment, motivating trainers, clean gym floor)...",
    defaultKeywords: "best gym, expert personal trainers, clean fitness facility, top equipment, motivating workout atmosphere",
  },
  {
    id: "hotel",
    name: "Hotel, Resort & Hospitality",
    categoryAliases: ["hotel", "resort", "motel", "hospitality", "stay", "lodging", "bed & breakfast", "bnb", "inn"],
    quickTags: [
      "Cozy, Spotless & Quiet Rooms",
      "Warm & Hospitable Staff",
      "Delicious Breakfast & Food",
      "Prime & Convenient Location",
      "Smooth Check-In & Check-Out",
      "Great Amenities & Service",
      "Peaceful & Relaxing Stay",
      "Fair & Transparent Pricing",
    ],
    placeholder: "Tell us what you loved (e.g. comfortable room, warm front desk hospitality, great views)...",
    defaultKeywords: "comfortable hotel rooms, great hospitality, prime location, spotless clean stay, highly recommended hotel",
  },
  {
    id: "retail",
    name: "Retail, Boutique & Shopping",
    categoryAliases: ["retail", "store", "shop", "boutique", "supermarket", "fashion", "jewelry", "electronics"],
    quickTags: [
      "Helpful & Polite Staff",
      "Great Selection of Products",
      "Neat & Organized Aisles",
      "Fair Prices & Great Deals",
      "Quick & Smooth Checkout",
      "High Product Quality",
      "Pleasant Shopping Experience",
      "Hassle-Free Assistance",
    ],
    placeholder: "Tell us what you loved (e.g. great selection, helpful staff, smooth checkout experience)...",
    defaultKeywords: "great product selection, friendly store associates, smooth checkout, quality merchandise, top store",
  },
  {
    id: "home_services",
    name: "Home Services, Plumbing & Electrician / HVAC",
    categoryAliases: ["plumbing", "electrician", "contractor", "cleaning", "hvac", "roofing", "painting", "home services", "handyman"],
    quickTags: [
      "Punctual & On-Time Arrival",
      "Clean & Professional Work",
      "Honest Upfront Estimates",
      "Quick Problem Resolution",
      "Courteous & Respectful Team",
      "High Craftsmanship & Durability",
      "Left Area Spotless & Clean",
      "Excellent Communication",
    ],
    placeholder: "Tell us what you loved (e.g. on-time arrival, tidy work, great communication, fair pricing)...",
    defaultKeywords: "punctual service, honest pricing, skilled technicians, clean and professional work, reliable contractor",
  },
  {
    id: "legal_professional",
    name: "Legal, Accounting & Professional Services",
    categoryAliases: ["legal", "law", "lawyer", "attorney", "accounting", "cpa", "finance", "consulting", "real estate", "realtor"],
    quickTags: [
      "Clear & Strategic Guidance",
      "Responsive & Timely Updates",
      "Trustworthy & Highly Professional",
      "Deep Expertise & Knowledge",
      "Transparent & Fair Billing",
      "Smooth & Stress-Free Process",
      "Attention to Detail",
      "Achieved Outstanding Results",
    ],
    placeholder: "Tell us what you loved (e.g. clear strategic advice, responsive communication, great results)...",
    defaultKeywords: "trusted legal advice, responsive professional, high expertise, transparent pricing, exceptional results",
  },
  {
    id: "general",
    name: "General Business & Services",
    categoryAliases: ["general", "other", "services", "agency"],
    quickTags: [
      "Friendly & Attentive Staff",
      "Super Clean & Welcoming",
      "Fast, Efficient Service",
      "High Quality & Care",
      "Fair & Transparent Pricing",
      "Great Atmosphere",
      "Professional & Reliable",
      "Highly Recommended",
    ],
    placeholder: "Tell us what you loved (e.g. loved the service, attentive staff, fast turnaround)...",
    defaultKeywords: "friendly staff, excellent service, high quality, highly recommended, professional and reliable",
  },
];

/**
 * Finds the best matching niche configuration based on business category or keywords.
 */
export function getNicheConfig(category?: string | null, customKeywords?: string | null): NicheConfig {
  const defaultNiche = NICHE_CONFIGS.find((n) => n.id === "general") || NICHE_CONFIGS[0];
  if (!category && !customKeywords) return defaultNiche;

  const searchText = `${category || ""} ${customKeywords || ""}`.toLowerCase();

  for (const config of NICHE_CONFIGS) {
    if (config.id === "general") continue;
    for (const alias of config.categoryAliases) {
      if (searchText.includes(alias)) {
        return config;
      }
    }
  }

  return defaultNiche;
}

/**
 * Returns merged quick tags for a business:
 * Combines category-specific highlights with any business-specific keywords if present.
 */
export function getBusinessQuickTags(
  category?: string | null,
  customKeywords?: string | null
): { tags: string[]; placeholder: string } {
  const niche = getNicheConfig(category, customKeywords);
  const baseTags = [...niche.quickTags];

  // If the business has custom keywords, add them as tags if they are short & catchy
  if (customKeywords) {
    const customList = customKeywords
      .split(/[,;\n]/)
      .map((k) => k.trim())
      .filter((k) => k.length > 2 && k.length <= 32);

    for (const kw of customList) {
      // Capitalize first letters for nice chip styling
      const formatted = kw
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      if (!baseTags.some((t) => t.toLowerCase() === formatted.toLowerCase())) {
        baseTags.unshift(formatted);
      }
    }
  }

  return {
    tags: baseTags.slice(0, 8), // Keep top 6-8 tags for clean mobile pill layout
    placeholder: niche.placeholder,
  };
}
