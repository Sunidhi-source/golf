# ⛳ Golf Charity Subscription Platform

> A subscription-driven web application combining golf performance tracking, charitable giving, and a monthly draw-based reward engine.

**Live Site →** [golf-six-tau.vercel.app](https://golf-six-tau.vercel.app)  
**Backend API →** [golf-u6ol.onrender.com](https://golf-u6ol.onrender.com)

---

## Test Credentials

| Role          | Email                    | Password |
| ------------- | ------------------------ | -------- |
| Administrator | admin@123.com            | hero123  |
| Test User     | _(sign up via the site)_ | —        |

---

## Features

### Subscriber Experience

- **Subscription Plans** — Monthly ($19/mo) and Yearly ($180/yr) via Stripe Checkout
- **Score Tracking** — Enter Stableford scores (1–45) with a date; rolling 5-score system automatically drops the oldest entry
- **Monthly Prize Draws** — Three-tier prize pool (5-match jackpot · 4-match · 3-match); jackpot rolls over if unclaimed
- **Charity Contribution** — Choose a charity at signup; contribute a minimum 10% of your subscription (adjustable up to 100%)
- **Winner Verification** — Upload proof of scores to claim a prize payout

### Admin Panel (`/admin`)

- **Draw Engine** — Run simulations (random or frequency-weighted); publish official results to the database
- **User Management** — View all subscribers, their scores, subscription status, and payout state; approve or reject winner claims; delete accounts
- **Charity Management** — Add, remove, and feature charities on the homepage
- **Live Stats** — Active subscriber count, total prize pool, and charity contribution totals in the header

---

## Tech Stack

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Frontend   | React 18, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express.js                   |
| Database   | Supabase (PostgreSQL)                 |
| Auth       | Supabase Auth (JWT)                   |
| Payments   | Stripe Checkout + Webhooks            |
| Deployment | Vercel (frontend) · Render (backend)  |

---

## Project Structure

```
golf/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page with featured charity
│   │   │   ├── Login.jsx         # Auth (login + signup)
│   │   │   ├── Dashboard.jsx     # User dashboard — scores, winnings, proof upload
│   │   │   └── AdminPanel.jsx    # Admin — draws, users, charities
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Auth-aware navigation
│   │   │   ├── Pricing.jsx       # Plan selection + charity picker
│   │   │   └── Signup.jsx        # Multi-step signup wrapper
│   │   ├── App.jsx               # Routes with protected admin + user guards
│   │   └── supabaseClient.js     # Supabase client initialisation
│   └── package.json
│
└── backend/
    ├── controllers/
    │   ├── userController.js     # Profile, scores, admin user management
    │   ├── drawController.js     # Simulate + publish monthly draws
    │   ├── charityController.js  # Charity CRUD
    │   ├── paymentController.js  # Stripe checkout session creation
    │   ├── scoreController.js    # Score routes
    │   └── webhookController.js  # Stripe webhook — activates subscription
    ├── routes/
    │   ├── userRoutes.js
    │   ├── drawRoutes.js
    │   ├── charityRoutes.js
    │   ├── paymentRoutes.js
    │   └── scoreRoutes.js
    ├── server.js
    └── package.json
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account (test mode is fine)

### 1. Clone the repo

```bash
git clone https://github.com/Sunidhi-source/golf.git
cd golf
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

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

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ADMIN_EMAIL=admin@123.com
```

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Database

Run the SQL in `supabase/SCHEMA_FIX.sql` in your Supabase SQL Editor. This creates all required tables and columns and sets up the auto-profile trigger.

---

## Database Schema

### `profiles`

| Column              | Type        | Notes                            |
| ------------------- | ----------- | -------------------------------- |
| id                  | uuid (PK)   | Matches `auth.users.id`          |
| email               | text        | Auto-populated from auth         |
| subscription_status | text        | `active` / `inactive`            |
| golf_scores         | jsonb       | Array of `{value, date}` objects |
| charity_id          | uuid (FK)   | References `charities.id`        |
| charity_percent     | int         | Default 10                       |
| payout_status       | text        | `Pending` / `Paid` / `Rejected`  |
| total_winnings      | numeric     | Cumulative prize amount          |
| created_at          | timestamptz | Auto-set                         |

### `charities`

| Column      | Type        | Notes             |
| ----------- | ----------- | ----------------- |
| id          | uuid        | PK                |
| name        | text        | Required          |
| description | text        |                   |
| is_featured | boolean     | Shows on homepage |
| created_at  | timestamptz |                   |

### `draws`

| Column           | Type        | Notes                   |
| ---------------- | ----------- | ----------------------- |
| id               | uuid        | PK                      |
| winning_numbers  | int[]       | 5 numbers drawn         |
| tier5_winners    | jsonb       | `[{id, email}]`         |
| tier4_winners    | jsonb       |                         |
| tier3_winners    | jsonb       |                         |
| jackpot_rollover | boolean     | True if no tier5 winner |
| published_at     | timestamptz |                         |

---

## Prize Pool Logic

Each active subscription contributes to the monthly prize pool:

| Tier           | Pool Share | Rollover?     |
| -------------- | ---------- | ------------- |
| 5-Number Match | 40%        | Yes (Jackpot) |
| 4-Number Match | 35%        | No            |
| 3-Number Match | 25%        | No            |

- If multiple winners share a tier, the prize is split equally.
- The 5-Match jackpot carries forward to the next month if unclaimed.

---

## Deployment

### Frontend (Vercel)

Set environment variables in the Vercel project dashboard — same keys as `frontend/.env`.

### Backend (Render)

Set environment variables in the Render service settings — same keys as `backend/.env`.

> Make sure `CLIENT_URL` in the backend env points to your live Vercel URL so Stripe redirects work correctly after checkout.

### Stripe Webhook

After deploying the backend, configure your Stripe webhook endpoint:

```
https://your-render-url.onrender.com/api/payments/webhook
```

Event to listen for: `checkout.session.completed`

---

## Built by

👩‍💻Sunidhi Sharma
