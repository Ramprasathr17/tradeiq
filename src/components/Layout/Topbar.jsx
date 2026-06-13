import React, { useState, useEffect } from 'react'
import { DEMO } from '../../lib/kite'

const PAGE_LABELS = {
  dashboard:'Dashboard', portfolio:'Portfolio', watchlist:'Watchlist',
  options:'Options Chain', strategy:'Strategy Builder', news:'News & Alerts',
  journal:'Trade Journal', learning:'Learning Center', settings:'Settings',
}

export default function Topbar({ auth, portfolio, page }) {
  const [time, setTime]       = useState(new Date())
  const [indices, setIndices] = useState(DEMO.indices)

  useEffect(() => {
    const t = setInterval(()=>setTime(new Date()), 1000)
    return ()=>clearInterval(t)
  }, [])

  const ist = time.toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit'})

  return (
    <div style={{
      background:'var(--surface)', borderBottom:'1px solid var(--border)',
      padding:'.75rem 2rem', display:'flex', alignItems:'center',
      justifyContent:'space-between', position:'sticky', top:0, zIndex:50
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        <h1 style={{ fontSize:17, fontWeight:600, letterSpacing:'-.3px' }}>
          {PAGE_LABELS[page]}
        </h1>
        <div style={{ display:'flex', gap:'.4rem' }}>
          {indices.map(idx=>(
            <div key={idx.name} style={{
              padding:'3px 10px', borderRadius:20, fontSize:11,
              fontFamily:'var(--mono)', fontWeight:500,
              background: idx.up?'rgba(0,212,170,.08)':'rgba(255,77,109,.08)',
              color: idx.up?'var(--green)':'var(--red)',
              border:`1px solid ${idx.up?'rgba(0,212,170,.2)':'rgba(255,77,109,.2)'}`,
              display:'flex', alignItems:'center', gap:3
            }}>
              <i className={`ti ti-trending-${idx.up?'up':'down'}`} style={{ fontSize:10 }}></i>
              {idx.name} {idx.value} {idx.pct}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        {auth.isDemo && (
          <span className="badge badge-orange">
            <span className="dot-live" style={{ width:5,height:5 }}></span> Demo
          </span>
        )}
        <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>
          IST {ist}
        </span>
        {portfolio.lastSync && (
          <span style={{ fontSize:11, color:'var(--text3)' }}>
            Synced {portfolio.lastSync.toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'})}
          </span>
        )}
        <button onClick={portfolio.refresh} className="btn btn-secondary btn-sm"
          disabled={portfolio.loading}>
          {portfolio.loading
            ? <span className="spinner-sm"></span>
            : <i className="ti ti-refresh" style={{ fontSize:14 }}></i>}
          {portfolio.loading ? 'Syncing…' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}
