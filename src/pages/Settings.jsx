import React, { useState, useEffect } from 'react'
import { getUserSettings, saveUserSettings } from '../lib/supabase'
import { kite } from '../lib/kite'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Settings({ auth }) {
  const { userId, isDemo, kiteUser, loginKite, logout } = auth || {}
  const [settings, setSettings] = useState({
    kite_api_key: import.meta.env.VITE_KITE_API_KEY || '',
    risk_per_trade: 2,
    default_exchange: 'NSE',
    notifications: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId || isDemo) return
    getUserSettings(userId).then(s => { if (s) setSettings(s) }).catch(() => {})
  }, [userId, isDemo])

  const save = async () => {
    if (!userId || isDemo) { toast.error('Login to save settings'); return }
    setSaving(true)
    try {
      await saveUserSettings(userId, settings)
      toast.success('Settings saved')
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const F = ({ label, children }) => (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, marginBottom: '.4rem' }}>{label}</div>
      {children}
    </div>
  )

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      {/* Account */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <div className="card-title"><i className="ti ti-user-circle"></i>Account</div>
          {isDemo && <span className="badge badge-orange">Demo Mode</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem 1rem', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--accent2),var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, flexShrink: 0,
          }}>{kiteUser?.user_name?.charAt(0) || 'U'}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{kiteUser?.user_name || 'Demo User'}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{kiteUser?.email || 'demo@tradeiq.app'} · {kiteUser?.user_id || 'DEMO01'}</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={logout} style={{ marginLeft: 'auto' }}>
            <i className="ti ti-logout"></i> Logout
          </button>
        </div>
      </div>

      {/* Kite Connect */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <div className="card-title"><i className="ti ti-plug"></i>Kite Connect</div>
          {kite.isAuthenticated()
            ? <span className="badge badge-green"><span className="dot-open" style={{ width: 5, height: 5 }}></span> Connected</span>
            : <span className="badge badge-gray">Not connected</span>}
        </div>
        <F label="API Key (from kite.trade/connect)">
          <input className="input" value={settings.kite_api_key}
            onChange={e => setSettings(p => ({ ...p, kite_api_key: e.target.value }))}
            placeholder="Enter your Kite API key" style={{ width: '100%' }} />
        </F>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={loginKite}>
            <i className="ti ti-brand-zerodha"></i> Connect Zerodha Kite
          </button>
          <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
            Your API secret stays in the Supabase Edge Function — never in the browser.
          </p>
        </div>
      </div>

      {/* Trading preferences */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <div className="card-title"><i className="ti ti-adjustments"></i>Trading Preferences</div>
        </div>
        <F label="Risk per trade (% of capital)">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="range" min={0.5} max={10} step={0.5}
              value={settings.risk_per_trade}
              onChange={e => setSettings(p => ({ ...p, risk_per_trade: parseFloat(e.target.value) }))}
              style={{ flex: 1, accentColor: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, minWidth: 36 }}>
              {settings.risk_per_trade}%
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Recommended: 1–3% per trade for options strategies.
          </p>
        </F>
        <F label="Default Exchange">
          <select className="input" value={settings.default_exchange}
            onChange={e => setSettings(p => ({ ...p, default_exchange: e.target.value }))}>
            <option>NSE</option><option>BSE</option><option>NFO</option>
          </select>
        </F>
        <F label="Price Alerts">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div onClick={() => setSettings(p => ({ ...p, notifications: !p.notifications }))}
              style={{
                width: 40, height: 22, borderRadius: 11,
                background: settings.notifications ? 'var(--accent)' : 'var(--surface3)',
                position: 'relative', transition: 'background .2s', cursor: 'pointer',
              }}>
              <div style={{
                position: 'absolute', top: 3, left: settings.notifications ? 20 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left .2s',
              }}></div>
            </div>
            <span style={{ fontSize: 13 }}>{settings.notifications ? 'Enabled' : 'Disabled'}</span>
          </label>
        </F>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <span className="spinner-sm"></span> : <i className="ti ti-device-floppy"></i>}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* Supabase info */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><i className="ti ti-database"></i>Supabase Storage</div>
          <span className="badge badge-green">Connected</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
          {[
            ['Holdings', 'Synced from Kite', 'ti-briefcase'],
            ['Positions', 'Live F&O data', 'ti-chart-dots-3'],
            ['Watchlist', 'Saved symbols', 'ti-star'],
            ['Alerts', 'Price & IV alerts', 'ti-bell'],
            ['Journal', 'Trade logs', 'ti-notebook'],
            ['Snapshots', 'Daily NAV history', 'ti-history'],
          ].map(([lbl, sub, icon]) => (
            <div key={lbl} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '.7rem .9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className={`ti ${icon}`} style={{ fontSize: 17, color: 'var(--accent)' }}></i>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{lbl}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: '1rem', lineHeight: 1.6 }}>
          All data is protected by Supabase Row Level Security — only you can see your data.
          Portfolio snapshots are automatically saved daily via a database trigger.
        </p>
      </div>
    </div>
  )
}
