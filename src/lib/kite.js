/**
 * Kite Connect client — all API calls go through Supabase Edge Function proxy
 * No Vercel / external backend needed.
 */
import { kiteProxyFetch } from './supabase'

const API_KEY = import.meta.env.VITE_KITE_API_KEY || ''
const REDIRECT = import.meta.env.VITE_KITE_REDIRECT_URL || `${window.location.origin}/auth/callback`

const TOKEN_KEY = 'kite_access_token'
const USER_KEY  = 'kite_user'

export const kite = {
  // ── Auth ─────────────────────────────────────────────────────────
  getLoginUrl() {
    return `https://kite.zerodha.com/connect/login?api_key=${API_KEY}&v=3&redirect_params=redirect_url=${encodeURIComponent(REDIRECT)}`
  },

  saveSession(accessToken, user) {
    sessionStorage.setItem(TOKEN_KEY, accessToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getAccessToken: () => sessionStorage.getItem(TOKEN_KEY),
  getUser: ()  => { try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null') } catch { return null } },
  clearSession: () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY) },
  isAuthenticated: () => !!sessionStorage.getItem(TOKEN_KEY),
  getKiteToken: () => `${API_KEY}:${sessionStorage.getItem(TOKEN_KEY)}`,

  // ── HTTP via Supabase Edge Function ──────────────────────────────
  async req(path, options = {}) {
    return kiteProxyFetch(path, this.getKiteToken(), options)
  },

  // ── User ─────────────────────────────────────────────────────────
  profile:  () => kite.req('/user/profile'),
  margins:  () => kite.req('/user/margins'),

  // ── Portfolio ────────────────────────────────────────────────────
  holdings:  () => kite.req('/portfolio/holdings'),
  positions: () => kite.req('/portfolio/positions'),

  // ── Orders ───────────────────────────────────────────────────────
  orders: () => kite.req('/orders'),
  trades: () => kite.req('/trades'),

  async placeOrder(variety, params) {
    const body = new URLSearchParams(params).toString()
    return kite.req(`/orders/${variety}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  },

  async cancelOrder(variety, orderId) {
    return kite.req(`/orders/${variety}/${orderId}`, { method: 'DELETE' })
  },

  // ── Market data ──────────────────────────────────────────────────
  async quote(instruments) {
    const q = instruments.map(i => `i=${encodeURIComponent(i)}`).join('&')
    return kite.req(`/quote?${q}`)
  },

  async ltp(instruments) {
    const q = instruments.map(i => `i=${encodeURIComponent(i)}`).join('&')
    return kite.req(`/quote/ltp?${q}`)
  },

  async ohlc(instruments) {
    const q = instruments.map(i => `i=${encodeURIComponent(i)}`).join('&')
    return kite.req(`/quote/ohlc?${q}`)
  },

  async historical(token, interval, from, to) {
    return kite.req(`/instruments/historical/${token}/${interval}?from=${from}&to=${to}&continuous=0`)
  },

  async instruments(exchange = 'NFO') {
    return kite.req(`/instruments/${exchange}`)
  },

  // ── Indices helper ───────────────────────────────────────────────
  indices() {
    return kite.quote(['NSE:NIFTY 50', 'BSE:SENSEX', 'NSE:NIFTY BANK'])
  },
}

// ── Mock data (demo mode) ────────────────────────────────────────────
export const DEMO = {
  holdings: [
    { tradingsymbol:'RELIANCE', exchange:'NSE', quantity:12, average_price:2845, last_price:2920, pnl:900, day_change_percentage:0.83 },
    { tradingsymbol:'TCS',      exchange:'NSE', quantity:8,  average_price:3920, last_price:4085, pnl:1320, day_change_percentage:1.54 },
    { tradingsymbol:'HDFCBANK', exchange:'NSE', quantity:20, average_price:1640, last_price:1590, pnl:-1000, day_change_percentage:-1.12 },
    { tradingsymbol:'INFY',     exchange:'NSE', quantity:15, average_price:1720, last_price:1810, pnl:1350, day_change_percentage:2.10 },
    { tradingsymbol:'ITC',      exchange:'NSE', quantity:100,average_price:462,  last_price:478,  pnl:1600, day_change_percentage:0.64 },
    { tradingsymbol:'TATAMOTORS',exchange:'NSE',quantity:30, average_price:820,  last_price:895,  pnl:2250, day_change_percentage:2.40 },
    { tradingsymbol:'WIPRO',    exchange:'NSE', quantity:50, average_price:580,  last_price:615,  pnl:1750, day_change_percentage:1.32 },
    { tradingsymbol:'BAJFINANCE',exchange:'NSE',quantity:5,  average_price:6800, last_price:7200, pnl:2000, day_change_percentage:1.80 },
  ],
  positions: [
    { tradingsymbol:'NIFTY24JUN24600CE', exchange:'NFO', product:'NRML', quantity:-50, average_price:215, last_price:198, pnl:850, instrument_type:'CE' },
    { tradingsymbol:'NIFTY24JUN24600PE', exchange:'NFO', product:'NRML', quantity:-50, average_price:198, last_price:210, pnl:-600, instrument_type:'PE' },
    { tradingsymbol:'RELIANCE24JUN3000CE',exchange:'NFO',product:'NRML', quantity:-25, average_price:42,  last_price:28,  pnl:350, instrument_type:'CE' },
    { tradingsymbol:'BANKNIFTY24JUN53000CE',exchange:'NFO',product:'NRML',quantity:-25,average_price:380, last_price:310, pnl:1750,instrument_type:'CE' },
  ],
  margins: { equity: { net:120500, used:82340, available:38160 } },
  profile:  { user_name:'Demo User', email:'demo@tradeiq.app', user_id:'DEMO01' },
  snapshots: Array.from({length:30},(_,i)=>({
    recorded_at: new Date(Date.now()-((29-i)*86400000)).toISOString().split('T')[0],
    total_value: 780000 + i*2200 + Math.sin(i)*8000,
    pnl: 80000 + i*2200,
  })),
  indices: [
    { name:'NIFTY',     value:'24,615', change:'+205',  pct:'+0.84%', up:true  },
    { name:'SENSEX',    value:'81,203', change:'-98',   pct:'-0.12%', up:false },
    { name:'BANKNIFTY', value:'52,840', change:'+624',  pct:'+1.20%', up:true  },
  ],
}

export const isDemoMode = () =>
  !import.meta.env.VITE_KITE_API_KEY ||
  import.meta.env.VITE_KITE_API_KEY === 'your_kite_api_key'
