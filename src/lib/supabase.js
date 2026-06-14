import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL     || ''
const SUPABASE_ANON    = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Edge Function base URL ─────────────────────────────────────────
export const EDGE_URL = `${SUPABASE_URL}/functions/v1`

// ── Auth ───────────────────────────────────────────────────────────
export const getSession  = () => supabase.auth.getSession()
export const getUser     = async () => { const { data: { user } } = await supabase.auth.getUser(); return user }
export const signOut     = () => supabase.auth.signOut()

export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUpWithEmail = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signInAnon = () => supabase.auth.signInAnonymously()

// ── Kite Session Exchange (via Supabase Edge Function) ─────────────
export async function exchangeKiteToken(request_token, api_key) {
  const res = await fetch(`${EDGE_URL}/kite-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
    },
    body: JSON.stringify({ request_token, api_key }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Token exchange failed')
  return data
}

// ── Kite API Proxy (via Supabase Edge Function) ────────────────────
export async function kiteProxyFetch(path, kiteToken, options = {}) {
  const res = await fetch(`${EDGE_URL}/kite-proxy${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'x-kite-token': kiteToken,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.message || `Error ${res.status}`)
  }
  const json = await res.json()
  return json.data ?? json
}
// ── Holdings ───────────────────────────────────────────────────────
export const getHoldings = async (userId) => {
  const { data, error } = await supabase.from('holdings').select('*')
    .eq('user_id', userId).order('current_value', { ascending: false })
  if (error) throw error
  return data || []
}

export const upsertHoldings = async (userId, holdings) => {
  if (!holdings?.length) return
  const rows = holdings.map(h => ({ ...h, user_id: userId, updated_at: new Date().toISOString() }))
  const { error } = await supabase.from('holdings').upsert(rows, { onConflict: 'user_id,tradingsymbol' })
  if (error) throw error
}

// ── Positions ──────────────────────────────────────────────────────
export const getPositions = async (userId) => {
  const { data, error } = await supabase.from('positions').select('*').eq('user_id', userId)
  if (error) throw error
  return data || []
}

export const upsertPositions = async (userId, positions) => {
  await supabase.from('positions').delete().eq('user_id', userId)
  if (!positions?.length) return
  const { error } = await supabase.from('positions').insert(
    positions.map(p => ({ ...p, user_id: userId }))
  )
  if (error) throw error
}

// ── Portfolio Snapshots ────────────────────────────────────────────
export const getSnapshots = async (userId, days = 30) => {
  const { data, error } = await supabase.from('portfolio_snapshots')
    .select('*').eq('user_id', userId)
    .order('recorded_at', { ascending: true })
    .limit(days)
  if (error) throw error
  return data || []
}

// ── Watchlist ──────────────────────────────────────────────────────
export const getWatchlist = async (userId) => {
  const { data, error } = await supabase.from('watchlist').select('*')
    .eq('user_id', userId).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export const addToWatchlist = async (userId, symbol, exchange = 'NSE') => {
  const { error } = await supabase.from('watchlist')
    .insert({ user_id: userId, tradingsymbol: symbol, exchange })
  if (error) throw error
}

export const removeFromWatchlist = async (userId, symbol) => {
  const { error } = await supabase.from('watchlist')
    .delete().eq('user_id', userId).eq('tradingsymbol', symbol)
  if (error) throw error
}

// ── Alerts ─────────────────────────────────────────────────────────
export const getAlerts = async (userId) => {
  const { data, error } = await supabase.from('alerts').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const createAlert = async (userId, alert) => {
  const { data, error } = await supabase.from('alerts')
    .insert({ ...alert, user_id: userId }).select().single()
  if (error) throw error
  return data
}

export const deleteAlert = async (id) => {
  const { error } = await supabase.from('alerts').delete().eq('id', id)
  if (error) throw error
}

export const updateAlertStatus = async (id, status) => {
  const { error } = await supabase.from('alerts')
    .update({ status, triggered_at: status === 'triggered' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

// ── Trade Journal ──────────────────────────────────────────────────
export const getJournal = async (userId) => {
  const { data, error } = await supabase.from('trade_journal').select('*')
    .eq('user_id', userId).order('entry_date', { ascending: false }).limit(50)
  if (error) throw error
  return data || []
}

export const addJournalEntry = async (userId, entry) => {
  const { data, error } = await supabase.from('trade_journal')
    .insert({ ...entry, user_id: userId }).select().single()
  if (error) throw error
  return data
}

export const deleteJournalEntry = async (id) => {
  const { error } = await supabase.from('trade_journal').delete().eq('id', id)
  if (error) throw error
}

// ── User Settings ──────────────────────────────────────────────────
export const getUserSettings = async (userId) => {
  const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).single()
  return data
}

export const saveUserSettings = async (userId, settings) => {
  const { error } = await supabase.from('user_settings')
    .upsert({ ...settings, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' })
  if (error) throw error
}

// ── Market News ────────────────────────────────────────────────────
export const getMarketNews = async (limit = 20) => {
  const { data, error } = await supabase.from('market_news').select('*')
    .order('published_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data || []
}

export const insertNews = async (newsItems) => {
  const { error } = await supabase.from('market_news').insert(newsItems)
  if (error) throw error
}
