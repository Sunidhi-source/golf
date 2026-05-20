<div align="center">

# ⛳ Digital Heroes — Golf Charity Platform

**Play. Give. Win.**

A subscription-driven web app combining golf performance tracking, charitable giving, and a monthly prize-draw engine.

[![Live Site](https://img.shields.io/badge/🌐%20Live%20Site-golf--six--tau.vercel.app-06b6d4?style=for-the-badge)](https://golf-six-tau.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️%20API-Render-46e3b7?style=for-the-badge)](https://golf-u6ol.onrender.com)
[![Stack](https://img.shields.io/badge/Stack-React%20·%20Node%20·%20Supabase%20·%20Stripe-334155?style=for-the-badge)](#-tech-stack)

</div>

---

## 📸 Screenshots

| Landing Page | Pricing Plans |
|---|---|
| ![Home](screenshots/home.png) | ![Pricing](screenshots/pricing.png) |

| User Dashboard | Admin — Draw Engine |
|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Admin](screenshots/admin-draw-engine.png) |

---

## ✨ Features

### For Subscribers

| Feature | Detail |
|---|---|
| 📅 **Subscription Plans** | Monthly ($19/mo) or Yearly ($180/yr) via Stripe Checkout |
| ⛳ **Score Tracking** | Enter Stableford scores (1–45); rolling 5-score window auto-drops the oldest |
| 🎰 **Monthly Prize Draws** | Three-tier pool — 5-match jackpot (40%) · 4-match (35%) · 3-match (25%); jackpot rolls over if unclaimed |
| ❤️ **Charity Contribution** | Pick a charity at signup; contribute 10–100% of your subscription |
| 🏆 **Winner Verification** | Upload proof-of-score to trigger payout review |

### For Admins (`/admin`)

| Feature | Detail |
|---|---|
| 🎲 **Draw Engine** | Run Random or Algorithmic (frequency-weighted) simulations; publish official results |
| 👥 **User Management** | View subscribers, scores, and status; approve/reject payout claims; delete accounts |
| 🏥 **Charity Management** | Add, remove, and feature charities shown on the homepage |
| 📋 **Reports** | Live stats — active subscribers, prize pool, charity raised, and full draw history |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (JWT) |
| **Payments** | Stripe Checkout + Webhooks |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## 🗂 Project Structure

```
golf/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx          # Landing page with featured charity
│       │   ├── Login.jsx         # Auth — login & signup
│       │   ├── Dashboard.jsx     # User dashboard — scores, draw, winnings
│       │   ├── AdminPanel.jsx    # Admin — draws, users, charities, reports
│       │   └── Charities.jsx     # Public charities listing
│       ├── components/
│       │   ├── Navbar.jsx        # Auth-aware navigation
│       │   ├── Pricing.jsx       # Plan selection + charity picker
│       │   └── Signup.jsx        # Multi-step signup wrapper
│       ├── App.jsx               # Routes with protected guards
│       └── supabaseClient.js     # Supabase client init
│
└── backend/
    ├── controllers/
    │   ├── userController.js     # Profile, scores, user management
    │   ├── drawController.js     # Simulate + publish monthly draws
    │   ├── charityController.js  # Charity CRUD
    │   ├── paymentController.js  # Stripe checkout session
    │   ├── scoreController.js    # Score submission
    │   └── webhookController.js  # Stripe webhook → activates subscription
    ├── middleware/
    │   └── authMiddleware.js     # JWT verification
    └── server.js
```

---

## 🚀 Local Setup

### Prerequisites

- **Node.js** 18+
- A **Supabase** project
- A **Stripe** account (test mode is fine)

### 1 · Clone

```bash
git clone https://github.com/Sunidhi-source/golf.git
cd golf
```

### 2 · Backend

```bash
cd backend && npm install
```

Create **`backend/.env`**:

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
```

```bash
npm start
```

### 3 · Frontend

```bash
cd frontend && npm install
```

Create **`frontend/.env`**:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ADMIN_EMAIL=admin@123.com
```

```bash
npm start
# → http://localhost:3000
```

### 4 · Database

Run `supabase/SCHEMA_FIX.sql` in your **Supabase SQL Editor** to create all tables and the auto-profile trigger.

---

## 🔐 Test Credentials

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@123.com` | `hero123` |
| Test User | *(sign up via the live site)* | — |

---

## 🗄 Database Schema

<details>
<summary><strong>profiles</strong></summary>

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Matches `auth.users.id` |
| `email` | text | Auto-populated from auth |
| `subscription_status` | text | `active` / `inactive` |
| `golf_scores` | jsonb | Array of `{value, date}` |
| `charity_id` | uuid (FK) | References `charities.id` |
| `charity_percent` | int | Default 10 |
| `payout_status` | text | `Pending` / `Paid` / `Rejected` |
| `total_winnings` | numeric | Cumulative prize amount |
| `created_at` | timestamptz | Auto-set |

</details>

<details>
<summary><strong>charities</strong></summary>

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | — |
| `name` | text | Required |
| `description` | text | — |
| `is_featured` | boolean | Shown on homepage |
| `created_at` | timestamptz | — |

</details>

<details>
<summary><strong>draws</strong></summary>

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | — |
| `winning_numbers` | int[] | 5 numbers drawn |
| `tier5_winners` | jsonb | 5-match jackpot winners |
| `tier4_winners` | jsonb | 4-match winners |
| `tier3_winners` | jsonb | 3-match winners |
| `jackpot_rollover` | boolean | `true` if no tier-5 winner |
| `published_at` | timestamptz | — |

</details>

---

## 🎰 Prize Pool Logic

| Tier | Pool Share | Rollover? |
|---|---|---|
| 🥇 5-Number Match | 40% | ✅ Jackpot carries forward |
| 🥈 4-Number Match | 35% | ❌ No |
| 🥉 3-Number Match | 25% | ❌ No |

Multiple winners in the same tier split the prize equally.

---

## ☁️ Deployment

### Frontend — Vercel
Add all `frontend/.env` keys as environment variables in your Vercel project dashboard.

### Backend — Render
Add all `backend/.env` keys in your Render service settings.

> ⚠️ Set `CLIENT_URL` to your live Vercel URL so Stripe redirects work post-checkout.

### Stripe Webhook
Register this endpoint in **Stripe Dashboard → Webhooks**, listening for `checkout.session.completed`:

```
https://your-render-url.onrender.com/api/payments/webhook
```

---

## 👩‍💻 Built by

**Sunidhi Sharma** — [github.com/Sunidhi-source](https://github.com/Sunidhi-source)
