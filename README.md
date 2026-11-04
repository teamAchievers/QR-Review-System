# SmartReview SaaS 🚀
### Intelligent QR Review Gating & Google SEO Review Booster Platform

SmartReview is a multi-tenant SaaS application that solves the two biggest challenges for local businesses:
1. **Shielding Google Business ratings from negative reviews**: Customers rating **≤ 3 stars** submit their grievances to a private internal management inbox instead of posting publicly on Google Maps.
2. **Accelerating 5-Star Reviews with Local SEO Keywords**: Customers rating **≥ 4 stars** have their authentic compliments polished and enriched with target business SEO keywords (e.g. *"emergency dentist"*, *"authentic wood-fired pizza"*), automatically copied to their clipboard, and directly launched into Google Reviews with 1 tap.

---

## 🌟 Key Features

### 1. Public QR Customer Experience (`/r/[businessSlug]`)
- **No Sign-In Required**: Fast, mobile-first, and friction-free.
- **Star Rating Selector (1 to 5 Stars)**.
- **≤ 3 Stars (Private Shield)**:
  - Empathetic prompt: *"We are so sorry we didn't meet expectations. Please tell our management team what happened."*
  - Written complaint form + optional customer contact details (name, phone, email).
  - Submits to private database and shows warm *"Thank you for your feedback"* page.
  - Keeps 1-3 star reviews **off** Google Maps.
- **≥ 4 Stars (Keyword Enrichment & 1-Click Google Post)**:
  - Celebratory prompt with quick highlight tags (e.g. *"Friendly Staff"*, *"Top Quality"*).
  - **AI / Keyword Enrichment Engine**: Polishes user remarks and organically incorporates target SEO keywords.
  - Review variation selector and editable textarea.
  - **"Copy & Post on Google Reviews (5★)"** action:
    - Auto-copies review to clipboard via `navigator.clipboard`.
    - Opens the business's direct Google Review dialog in a new tab.
    - Displays step-by-step guidance modal: *"Review copied! Just tap and hold to Paste and hit Post."*

### 2. Master Super Admin Portal (`/admin`)
- **Platform Analytics**: Total businesses onboarded, total QR scans, complaints caught privately, and 5-star Google redirects generated.
- **Tenant & User Provisioning**:
  - Add new business profiles (Name, Slug, Category, City, Google Review URL, Target SEO Keywords).
  - Automatically creates the Business Admin user login credentials in one click.
- **Business Directory**: Instant links to test QR funnels, copy public links, download high-res QR codes (PNG/SVG), or toggle business status.

### 3. Business Client Dashboard (`/dashboard`)
- **Live Performance Metrics**: Scans, 1-3★ protected count, 4-5★ keyword-stuffed count, Google conversions.
- **QR Code & Standee Studio**:
  - Live QR code generator.
  - Printable **Table-Tent / Counter Standee** with 1-click print button (`window.print()`).
  - High-res PNG & SVG downloads.
- **Private Feedback Inbox**:
  - Review all 1–3 star complaints.
  - Customer contact information for follow-up.
  - Status management (`NEW` → `IN_PROGRESS` → `RESOLVED`) with internal notes.
- **Keywords & SEO Configuration**:
  - Edit Google Review URL.
  - Target SEO keywords for review stuffing.
  - Review tone adjustments and minimum star gating threshold.

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Master Super Admin** | `admin@smartreview.io` | `AdminPassword123!` | `/admin` |
| **Business Client (Apex Dental)** | `owner@apexdental.com` | `Dental123!` | `/dashboard` & `/r/apex-dental` |
| **Business Client (Bella Napoli)** | `mario@bellanapoli.com` | `Pizza123!` | `/dashboard` & `/r/bella-napoli` |

> *Quick autofill buttons are also built directly into the `/login` page.*

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Database**: SQLite with Prisma ORM (`prisma/schema.prisma`)
- **Authentication**: JWT Cookies + BCrypt password hashing
- **QR Engine**: `qrcode` (SVG & PNG dynamic buffers)
- **AI Engine**: Google Gemini API with smart algorithmic keyword-weaving fallback

---

## 🚀 Running the Project

```bash
# 1. Navigate to workspace
cd "D:\Coding Data\smart-review"

# 2. Run the development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

To re-seed the sample data at any time:
```bash
npm run seed
```
