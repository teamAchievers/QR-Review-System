# SmartReview SaaS™ | Official Marketing & Client Onboarding Website

High-end, conversion-optimized SaaS product website for **SmartReview SaaS** (`D:\Coding Data\smart-review`), the intelligent QR review gating and Google SEO review booster platform.

---

## 🌟 What This Website Features

1. **Interactive Dual-Funnel Review Simulator**:
   - Prospective clients can test both the **Google 5-Star VIP Lane** and the **≤ 3-Star Private Shield Gate** directly on the landing page.
   - Includes real seeded demo businesses: **Apex Dental Studio** (`/r/apex-dental`) and **Bella Napoli Pizzeria** (`/r/bella-napoli`).
   - Demonstrates the AI Keyword Enrichment engine and 1-tap clipboard copy into Google Reviews.

2. **Interactive 3D Hardware & Standee Studio**:
   - Real-time customizer where business owners can preview their brand name, accent colors, and custom engraving on physical NFC + QR stands (Matte Obsidian, Frosted Crystal, Brushed Brass, and Walnut Eco).

3. **Dynamic ROI & Revenue Lift Calculator**:
   - Sliders for monthly footfall, current Google rating, and average ticket size.
   - Computes monthly 5-star review gain, deflected negative reviews, and projected local sales boost based on Harvard Business School rating economics.

4. **Transparent SaaS Pricing Plans**:
   - **Starter Shield** ($39/mo or $31/mo billed annually)
   - **Growth & SEO Booster Pro** ($79/mo or $63/mo billed annually - *Most Popular*)
   - **Multi-Location Enterprise** ($199/mo or $159/mo billed annually)
   - Annual billing switch with 20% discount and free custom acrylic standee delivery.

5. **Multi-Step Subscription & Onboarding Checkout Modal**:
   - Complete SaaS sign-up workflow: Plan selection, business information, manager SMS alert phone, Google Place ID lookup, shipping address for physical stands, and 14-day free trial guarantee ($0 charged today).
   - Instant digital QR generation and 1-click launch to the Client Dashboard Login.

6. **Seamless Integration with the Review System Backend (`D:\Coding Data\smart-review`)**:
   - "Portal Login" button directs to `http://localhost:3000/login`.
   - "Super Admin" links connect to `http://localhost:3000/admin`.
   - Live endpoints for `/r/apex-dental` and `/r/bella-napoli`.

---

## 🚀 How to Run the Website

### Running the Marketing Website:
```bash
# Navigate to website directory
cd "D:\Coding Data\smart-review\website"

# Start the Vite development server (runs on http://localhost:5173)
npm run dev

# Or build static assets for production deployment
npm run build
```

### Running the Review System Backend (Next.js):
In a separate terminal:
```bash
# Navigate to the root review system
cd "D:\Coding Data\smart-review"

# Start the Next.js server (runs on http://localhost:3000)
npm run dev
```

Both run seamlessly side-by-side with zero port conflicts!
