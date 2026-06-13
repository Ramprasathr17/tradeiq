# TradeIQ v2 — Options & Portfolio Dashboard

> **100% Supabase** — No Vercel, no backend server, no extra hosting needed.
> Live on GitHub Pages. Data on Supabase. Secrets in Supabase Edge Functions.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-2-3fcf8e?style=flat-square&logo=supabase)
![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub_Pages-222?style=flat-square&logo=github)

---

## Architecture (No Backend Required)

```
Browser (React SPA on GitHub Pages)
        │
        ├── Supabase JS SDK ──────────► Supabase Database (PostgreSQL + RLS)
        │                               ├── holdings, positions, watchlist
        │                               ├── alerts, journal, snapshots
        │                               └── auto-trigger: daily NAV snapshots
        │
        └── fetch() ─────────────────► Supabase Edge Functions (Deno)
                                        ├── /kite-session  ← token exchange (secret here)
                                        └── /kite-proxy    ← forwards all Kite API calls
                                                  │
                                                  └──► api.kite.trade (live NSE data)
```

**Why this works without Vercel:**
- Supabase Edge Functions run on Deno at the edge — they replace your Node.js backend
- The Kite API secret is stored as a Supabase secret (`supabase secrets set`)
- The browser never sees the API secret
- GitHub Pages serves the static React build
- Supabase handles auth, database, and API proxying

---

## Features

| Page | Description |
|------|-------------|
| 🏠 Dashboard | Portfolio P&L, allocation chart, top holdings, market pulse |
| 💼 Portfolio | Full holdings + open F&O positions with live prices |
| 👁 Watchlist | Add/remove symbols, intraday chart, snapshots — saved to Supabase |
| 📊 Options | NIFTY/BANKNIFTY options chain with OI, IV%, PCR, max pain |
| ♟ Strategy | 6 strategies with interactive payoff diagrams + Greeks |
| 📰 News | Market news feed with filters + price alert manager (saved to DB) |
| 📓 Journal | Full trade journal — log, tag, track P&L — saved to Supabase |
| 📚 Learning | Courses by level (Beginner → Advanced) + options glossary |
| ⚙ Settings | Kite connect, risk preferences, notifications toggle |

---

## Project Structure

```
tradeiq/
├── src/
│   ├── lib/
│   │   ├── supabase.js          # Supabase client + all DB helpers
│   │   └── kite.js              # Kite client using Edge Function proxy
│   ├── hooks/
│   │   ├── useAuth.js           # Supabase auth + Kite OAuth context
│   │   └── usePortfolio.js      # Portfolio data, polling, sync
│   ├── components/Layout/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── TickerTape.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx        # Email + Kite OAuth + Demo login
│   │   ├── AuthCallback.jsx     # Kite OAuth redirect handler
│   │   ├── Dashboard.jsx
│   │   ├── Portfolio.jsx
│   │   ├── Watchlist.jsx        # Supabase-persisted watchlist
│   │   ├── Options.jsx
│   │   ├── Strategy.jsx
│   │   ├── Learning.jsx
│   │   ├── News.jsx             # Supabase-persisted alerts
│   │   ├── Journal.jsx          # Full trade journal → Supabase
│   │   └── Settings.jsx
│   ├── styles/global.css
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── functions/
│   │   ├── kite-session/        # Edge Function: token exchange
│   │   │   └── index.ts
│   │   └── kite-proxy/          # Edge Function: Kite API proxy
│   │       └── index.ts
│   └── migrations/
│       └── 001_schema.sql       # Full DB schema with RLS + triggers
├── .github/workflows/
│   └── deploy.yml               # Auto-deploy to GitHub Pages
├── .env.example
├── vite.config.js
└── package.json
```

---

## Setup Guide

### Step 1 — Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a region close to India (e.g. `ap-south-1` Mumbai)
3. Go to **SQL Editor** → paste the entire contents of `supabase/migrations/001_schema.sql` → **Run**
4. Go to **Settings → API** → copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
5. Go to **Settings → API** → copy **service_role key** (keep this safe — only for Edge Functions)

### Step 2 — Kite Connect App

1. Go to [kite.trade/connect](https://kite.trade/connect) → **Create App**
2. App Type: **Web**
3. Redirect URL (add all, comma-separated):
   ```
   http://localhost:3000/tradeiq/auth/callback
   https://github.com/Ramprasathr17/tradeiq/auth/callback
   ```
4. Note your **API Key** and **API Secret**

### Step 3 — Supabase CLI & Edge Functions

Install the Supabase CLI:
```bash
# macOS
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (cross-platform)
npm install -g supabase
```

Login and link your project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
# Project ID is in: supabase.com → Settings → General → Reference ID
```

Set secrets for Edge Functions (these NEVER go in .env):
```bash
supabase secrets set KITE_API_SECRET=your_kite_api_secret_here
supabase secrets set KITE_API_KEY=your_kite_api_key_here

# Supabase auto-injects SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
# into Edge Functions — no need to set those manually
```

Deploy Edge Functions:
```bash
supabase functions deploy kite-session
supabase functions deploy kite-proxy
```

Verify they're live:
```bash
supabase functions list
# Should show: kite-session, kite-proxy with status ACTIVE
```

### Step 4 — Local Development

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/tradeiq.git
cd tradeiq
npm install

# Configure env
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
VITE_KITE_API_KEY=your_kite_api_key
VITE_KITE_REDIRECT_URL=http://localhost:3000/tradeiq/auth/callback
```

Run:
```bash
npm run dev
# → http://localhost:3000/tradeiq
```

### Step 5 — Deploy to GitHub Pages

**Push your code to GitHub:**
```bash
git init
git add .
git commit -m "Initial TradeIQ commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tradeiq.git
git push -u origin main
```

**Enable GitHub Pages:**
1. Go to your repo → **Settings** → **Pages**
2. Source: **GitHub Actions**

**Add GitHub Secrets** (repo → Settings → Secrets and variables → Actions → New repository secret):

| Secret Name | Value |
|-------------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your anon key |
| `VITE_KITE_API_KEY` | your Kite API key |
| `VITE_KITE_REDIRECT_URL` | `https://YOUR_USERNAME.github.io/tradeiq/auth/callback` |

**Push any commit** → GitHub Actions will automatically build and deploy.

Your app will be live at:
```
https://YOUR_USERNAME.github.io/tradeiq
```

---

## How Kite OAuth Works (Full Flow)

```
1. User clicks "Connect Kite"
        ↓
2. Redirect → kite.zerodha.com/connect/login?api_key=XXX&v=3
        ↓
3. User logs in on Zerodha's site
        ↓
4. Zerodha redirects → your-site.io/auth/callback?request_token=YYY&status=success
        ↓
5. AuthCallback.jsx extracts request_token
        ↓
6. POST to Supabase Edge Function /kite-session
   {request_token: "YYY", api_key: "XXX"}
        ↓
7. Edge Function (runs on Deno, server-side):
   - Reads KITE_API_SECRET from Supabase secrets
   - Computes SHA256(api_key + request_token + api_secret)
   - POST to api.kite.trade/session/token
   - Returns {access_token, user}
        ↓
8. access_token saved in sessionStorage (cleared on tab close)
        ↓
9. All subsequent Kite API calls →
   fetch to /kite-proxy Edge Function
   with header: x-kite-token: api_key:access_token
        ↓
10. Edge Function forwards to api.kite.trade and returns response
```

**Security notes:**
- `api_secret` never leaves Supabase Edge Functions
- `access_token` is in `sessionStorage` (not `localStorage`) — clears when browser closes
- Supabase RLS ensures users can only read their own data
- The `anon` key in the browser is safe — it's row-level secured

---

## Supabase Edge Functions Reference

### `kite-session` — Token Exchange

```
POST /functions/v1/kite-session
Headers: { apikey: SUPABASE_ANON_KEY }
Body: { request_token: string, api_key: string }
Returns: { access_token: string, user: { user_name, user_id, email } }
```

### `kite-proxy` — API Proxy

```
GET|POST /functions/v1/kite-proxy{kite_path}
Headers: {
  apikey: SUPABASE_ANON_KEY,
  x-kite-token: "api_key:access_token"
}

Examples:
GET /functions/v1/kite-proxy/portfolio/holdings
GET /functions/v1/kite-proxy/quote?i=NSE:RELIANCE&i=NSE:TCS
POST /functions/v1/kite-proxy/orders/regular
```

---

## Database Schema Summary

| Table | Purpose |
|-------|---------|
| `kite_sessions` | Stores Kite access tokens post-login |
| `holdings` | Equity holdings synced from Kite |
| `positions` | Open F&O positions |
| `portfolio_snapshots` | Daily NAV history (auto via trigger) |
| `watchlist` | User's watchlist symbols |
| `alerts` | Price, IV, earnings alerts |
| `trade_journal` | Manual trade notes and P&L log |
| `user_settings` | Per-user preferences |
| `market_news` | Cached news (can be populated via cron) |

All tables have **Row Level Security** — `auth.uid() = user_id`.

---

## Kite API Rate Limits

| Type | Limit | Used for |
|------|-------|---------|
| REST API | 10 req/s | Holdings, positions, orders |
| Quote API | 1 req/s | Live prices |
| Historical API | 3 req/s | Candle data |

The `usePortfolio` hook polls every **60 seconds** during market hours (9:15–15:30 IST, Mon–Fri) to stay well within limits.

---

## Demo Mode

If no Kite API key is configured (or you choose "Try Demo Mode"), the app uses realistic simulated data:
- 8 equity holdings with P&L
- 4 open F&O positions
- 30 days of portfolio history
- All pages fully interactive

No credentials needed for demo mode.

---

## Customising the Base Path

If your GitHub repo name is different from `tradeiq`, update these two places:

**`vite.config.js`:**
```js
base: '/your-repo-name/',
```

**`src/main.jsx`:**
```jsx
<BrowserRouter basename="/your-repo-name">
```

If you're using a **custom domain** (e.g. `tradeiq.yourdomain.com`), set both to `'/'`.

---

## Custom Domain (Optional)

1. Add a `CNAME` file to the `public/` folder:
   ```
   tradeiq.yourdomain.com
   ```
2. In your DNS provider, add a CNAME record:
   ```
   tradeiq → YOUR_USERNAME.github.io
   ```
3. In GitHub Pages settings, enter your custom domain
4. Update Kite redirect URL to `https://tradeiq.yourdomain.com/auth/callback`
5. Update `vite.config.js` base to `'/'`

---

## Local Edge Function Testing

You can run Edge Functions locally with:
```bash
supabase start
supabase functions serve kite-session --env-file .env.local
supabase functions serve kite-proxy   --env-file .env.local
```

Create `.env.local` for local Edge Function secrets:
```env
KITE_API_SECRET=your_secret
KITE_API_KEY=your_key
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after deploy | Check `base` in `vite.config.js` matches your repo name |
| Kite login fails | Verify redirect URL in Kite app settings matches exactly |
| Edge Function 500 error | Run `supabase secrets list` to confirm `KITE_API_SECRET` is set |
| Holdings not loading | Check Kite access token hasn't expired (expires at midnight IST) |
| Supabase 401 error | Confirm `VITE_SUPABASE_ANON_KEY` is correct |
| CORS error on Edge Function | The functions include `Access-Control-Allow-Origin: *` — check function deployed correctly |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Pure CSS variables (custom dark theme, no Tailwind) |
| Charts | Chart.js 4 via react-chartjs-2 |
| Auth | Supabase Auth (email + Kite OAuth) |
| Database | Supabase PostgreSQL with RLS |
| Serverless | Supabase Edge Functions (Deno) |
| Hosting | GitHub Pages (free) |
| Market Data | Zerodha Kite Connect v3 |

---

## Disclaimer

This tool is for informational and educational purposes only. It is not financial advice. Options trading involves significant risk of loss. Always conduct your own research. TradeIQ is not affiliated with Zerodha or NSE.

---

## License

MIT — free to use, fork, and modify.
