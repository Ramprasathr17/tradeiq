import React from 'react'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { section:'Overview' },
  { id:'dashboard', icon:'ti-layout-dashboard', label:'Dashboard' },
  { id:'portfolio',  icon:'ti-briefcase',        label:'Portfolio' },
  { id:'watchlist',  icon:'ti-eye',              label:'Watchlist' },
  { section:'Trading' },
  { id:'options',    icon:'ti-chart-dots-3',     label:'Options Chain' },
  { id:'strategy',   icon:'ti-chess',            label:'Strategy Builder' },
  { section:'Tools' },
  { id:'news',       icon:'ti-news',             label:'News & Alerts' },
  { id:'journal',    icon:'ti-notebook',         label:'Trade Journal' },
  { id:'learning',   icon:'ti-school',           label:'Learning' },
  { section:'Account' },
  { id:'settings',   icon:'ti-settings',         label:'Settings' },
]

function MarketStatus() {
  const ist   = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'}))
  const mins  = ist.getHours()*60+ist.getMinutes()
  const isWkd = ist.getDay()===0||ist.getDay()===6
  const isOpen= !isWkd && mins>=555 && mins<=930
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:500 }}>
      <div className={isOpen?'dot-open':'dot-live'} style={{ animationPlayState: isOpen?'running':'paused', background: isOpen?'var(--green)':'var(--red)' }}></div>
      <span style={{ color: isOpen?'var(--green)':'var(--text3)' }}>
        {isWkd ? 'Weekend' : isOpen ? 'NSE Open' : 'NSE Closed'}
      </span>
    </div>
  )
}

export default function Sidebar({ page, onNav }) {
  const { isDemo, kiteUser, logout } = useAuth()
  return (
    <aside style={{
      position:'fixed', left:0, top:0, bottom:0, width:'var(--sidebar-w)',
      background:'var(--surface)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', zIndex:100,
      overflowY:'auto'
    }}>
      {/* Logo */}
      <div style={{ padding:'1.25rem 1.25rem 1rem', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34,
            background:'linear-gradient(135deg,var(--accent),var(--accent2))',
            borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
          }}>
            <i className="ti ti-chart-candle" style={{ color:'#fff', fontSize:17 }}></i>
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, letterSpacing:'-.5px', lineHeight:1 }}>
              Trade<span style={{ color:'var(--accent)' }}>IQ</span>
            </div>
            {isDemo && (
              <span style={{
                fontSize:9, fontWeight:700, background:'rgba(255,107,53,.15)',
                color:'var(--accent3)', padding:'1px 5px', borderRadius:3,
                letterSpacing:'1px', textTransform:'uppercase'
              }}>Demo</span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'.5rem .75rem', display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map((item, i) => item.section ? (
          <div key={i} style={{
            fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px',
            color:'var(--text3)', padding:'.6rem .75rem .2rem',
            marginTop: i > 0 ? '.25rem' : 0
          }}>{item.section}</div>
        ) : (
          <button key={item.id} onClick={()=>onNav(item.id)} style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'.6rem .85rem', borderRadius:'var(--radius-sm)',
            fontSize:13, fontWeight:500, width:'100%', textAlign:'left',
            color: page===item.id ? 'var(--accent)' : 'var(--text2)',
            background: page===item.id ? 'rgba(0,212,170,.08)' : 'transparent',
            border:`1px solid ${page===item.id ? 'rgba(0,212,170,.18)' : 'transparent'}`,
            transition:'all .15s',
          }}>
            <i className={`ti ${item.icon}`} style={{ fontSize:17, width:20 }}></i>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:'.75rem 1rem', borderTop:'1px solid var(--border)' }}>
        <MarketStatus />
        {kiteUser && (
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'.6rem .25rem', marginTop:'.5rem'
          }}>
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:'linear-gradient(135deg,var(--accent2),var(--accent))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, flexShrink:0
            }}>{kiteUser.user_name?.charAt(0)||'U'}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {kiteUser.user_name}
              </div>
              <div style={{ fontSize:10, color:'var(--text3)' }}>{kiteUser.user_id || 'Kite'}</div>
            </div>
            <button onClick={logout} title="Logout" style={{ color:'var(--text3)', fontSize:16 }}>
              <i className="ti ti-logout"></i>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
