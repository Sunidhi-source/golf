cat << 'EOF' > README.md

# ⛳ Digital Heroes: Golf Charity Subscription Platform

### _Premium Full-Stack Trainee Selection Assignment_

A modern, subscription-driven web application that disrupts traditional golf aesthetics[cite: 12]. This platform seamlessly integrates performance tracking, a custom reward engine, and charitable giving[cite: 7, 11].

---

## 🚀 Live Links & Credentials

- **Live Website (Vercel)**: `https://golf-six-tau.vercel.app/`
- **Backend API (Render)**: `https://golf-u6ol.onrender.com`
- **Admin Dashboard**: Accessible via the Admin Panel deliverable.

**Authentication Details:**
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@123.com` | `hero123` |

---

## ✅ Core Features Implemented

### 💳 Subscription & Access Control (Section 04)

- **Stripe Integration**: Supports both **Monthly** and **Yearly** tiers[cite: 41].
- **Real-time Validation**: Secure access control ensures only active subscribers can access platform features[cite: 41].

### 📊 Precision Score Management (Section 05)

- **Rolling 5-Score Logic**: Enforces a strict **Latest 5** policy where new entries automatically replace the oldest[cite: 48, 49].
- **Stableford Validation**: System-level constraints restrict entries to the **1-45 range**[cite: 45].
- **Reverse Chronological UI**: Scores are displayed most recent first[cite: 50].

### 🎰 Custom Draw & Prize Engine (Section 06 & 07)

- **Tiered Distribution**: Automated calculation of prize pools following the **40% / 35% / 25%** split[cite: 70].
- **Simulation Mode**: Admin capability to run and analyze draws before official results are published[cite: 63, 104].
- **Jackpot Rollover**: 5-Match jackpot carries forward if unclaimed[cite: 63, 73].

### ❤️ Charitable Impact (Section 08)

- **Enforced Minimums**: System automatically allocates a **minimum of 10%** of every subscription to charity[cite: 77].
- **User Selection**: Seamless integration for users to select their impact recipient at signup[cite: 76].

---

## 🛠️ Technical Architecture

- **Frontend**: React.js with **Framer Motion** for a modern, motion-enhanced UI[cite: 121].
- **Backend**: Node.js & Express.js[cite: 171].
- **Database**: **Supabase** with a structured schema for data integrity[cite: 135, 137].
- **UI/UX Philosophy**: Deliberately avoided "golf clichés" to focus on emotional engagement and charitable impact[cite: 120, 121].

---

## 📈 Scalability Thinking (Section 14)

- **Multi-Country Ready**: Architecture supports global expansion[cite: 132, 133].
- **Extensible Codebase**: Structured to support future mobile app versions and corporate accounts[cite: 133].
- **Secure Auth**: Implemented JWT/Session-based authentication with HTTPS enforcement[cite: 125].

---

## ⚙️ Environment Configuration

### Backend Setup

1. Create a `.env` in the `/backend` directory.
2. Required Keys:
   bash ```
   PORT=5000
   STRIPE_PUBLISHABLE_KEY=''
   STRIPE_SECRET_KEY=''
   STRIPE_MONTHLY_PRICE_ID=''
   STRIPE_YEARLY_PRICE_ID=''
   CLIENT_URL=http://localhost:3000
   SUPABASE_URL=''
   SUPABASE_SERVICE_ROLE_KEY=''
   STRIPE_WEBHOOK_SECRET=''
   SUPABASE_KEY=''

````

3. The backend uses the `dotenv` package to load variables into `process.env`.

### Frontend Setup
1. Create a `.env` in the `/frontend` directory.
2. Required Keys:
bash ```
  REACT_APP_SUPABASE_URL=''
  REACT_APP_SUPABASE_ANON_KEY=''
  REACT_APP_API_URL=backend_url

  REACT_APP_ADMIN_EMAIL=admin@123.com
  REACT_APP_ADMIN_PASSWORD=hero123
````

3. Note: All frontend variables are prefixed with `REACT_APP_` to be accessible within the React build.

---

EOF
