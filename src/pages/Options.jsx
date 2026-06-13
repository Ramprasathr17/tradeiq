// Options.jsx
import React, { useState } from 'react'

const CHAIN=[
  {strike:24000,c_oi:'28.4L',c_vol:'8.2L',c_iv:12.4,c_ltp:842, p_ltp:28, p_iv:8.2, p_vol:'1.2L',p_oi:'14.2L'},
  {strike:24200,c_oi:'32.1L',c_vol:'9.8L',c_iv:11.8,c_ltp:612, p_ltp:42, p_iv:9.1, p_vol:'2.1L',p_oi:'18.6L'},
  {strike:24400,c_oi:'41.2L',c_vol:'12.4L',c_iv:10.9,c_ltp:385,p_ltp:68, p_iv:10.2,p_vol:'3.8L',p_oi:'22.4L'},
  {strike:24600,c_oi:'56.8L',c_vol:'18.6L',c_iv:10.2,c_ltp:215,p_ltp:198,p_iv:10.4,p_vol:'17.2L',p_oi:'54.2L',atm:true},
  {strike:24800,c_oi:'38.4L',c_vol:'10.2L',c_iv:10.8,c_ltp:142,p_ltp:284,p_iv:11.2,p_vol:'11.4L',p_oi:'42.8L'},
  {strike:25000,c_oi:'22.6L',c_vol:'6.8L', c_iv:11.4,c_ltp:84, p_ltp:398,p_iv:12.4,p_vol:'8.2L', p_oi:'31.4L'},
  {strike:25200,c_oi:'14.2L',c_vol:'3.6L', c_iv:12.1,c_ltp:42, p_ltp:520,p_iv:13.2,p_vol:'4.8L', p_oi:'22.1L'},
]
const UNDERLYINGS=['NIFTY','BANKNIFTY','FINNIFTY']
const EXPIRIES=['19 Jun 2025','26 Jun 2025','31 Jul 2025']

export function Options() {
  const [under, setUnder] = useState('NIFTY')
  const [expiry, setExpiry] = useState(EXPIRIES[0])
  const spots={NIFTY:24615,BANKNIFTY:52840,FINNIFTY:23480}

  return (
    <div className="fade-in">
      <div style={{display:'flex',gap:'.6rem',marginBottom:'1.5rem',alignItems:'center',flexWrap:'wrap'}}>
        {UNDERLYINGS.map(u=>(
          <button key={u} onClick={()=>setUnder(u)} className={`btn ${under===u?'btn-primary':'btn-secondary'}`}>
            {u}
          </button>
        ))}
        <select value={expiry} onChange={e=>setExpiry(e.target.value)} style={{marginLeft:'.25rem'}}>
          {EXPIRIES.map(ex=><option key={ex}>{ex}</option>)}
        </select>
        <span style={{fontSize:13,color:'var(--text2)',marginLeft:'.5rem'}}>
          Spot: <strong style={{color:'var(--text)',fontFamily:'var(--mono)'}}>{spots[under]?.toLocaleString('en-IN')}</strong>
        </span>
        <span className="badge badge-green" style={{marginLeft:'auto'}}>PCR: 0.84</span>
        <span className="badge badge-purple">ATM: 24,600</span>
        <span className="badge badge-live"><span className="dot-live" style={{width:5,height:5}}></span>Live</span>
      </div>

      <div className="grid-4" style={{marginBottom:'1.5rem'}}>
        {[
          ['Put-Call Ratio','0.84','Slight bearish bias','ti-arrows-exchange','var(--accent3)'],
          ['ATM IV','10.2%','India VIX: 12.45','ti-wave-sine','var(--accent2)'],
          ['Max Pain','24,400','Options expiry magnet','ti-chart-bar','var(--green)'],
          ['Days to Expiry','12','Theta accelerating','ti-clock','var(--red)'],
        ].map(([lbl,val,ch,icon,col])=>(
          <div key={lbl} className="stat-card">
            <div className="stat-label"><i className={`ti ${icon}`} style={{fontSize:13,color:col}}></i>{lbl}</div>
            <div className="stat-value" style={{fontSize:20}}>{val}</div>
            <div className="stat-change">{ch}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><i className="ti ti-table"></i>{under} Options Chain — {expiry}</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:'var(--mono)',fontSize:12}}>
            <thead>
              <tr>
                <th colSpan={4} style={{textAlign:'center',color:'var(--green)',padding:'.5rem',borderBottom:'2px solid var(--border2)',fontSize:11,letterSpacing:1}}>CALLS</th>
                <th style={{textAlign:'center',padding:'.5rem',borderBottom:'2px solid var(--border)',background:'var(--surface2)',color:'var(--text2)'}}>STRIKE</th>
                <th colSpan={4} style={{textAlign:'center',color:'var(--red)',padding:'.5rem',borderBottom:'2px solid var(--border2)',fontSize:11,letterSpacing:1}}>PUTS</th>
              </tr>
              <tr style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.8px',color:'var(--text3)'}}>
                {['OI','Vol','IV%','LTP'].map(h=><th key={`c${h}`} style={{padding:'.35rem .5rem',textAlign:'center',borderBottom:'1px solid var(--border)'}}>{h}</th>)}
                <th style={{background:'var(--surface2)',borderBottom:'1px solid var(--border)'}}></th>
                {['LTP','IV%','Vol','OI'].map(h=><th key={`p${h}`} style={{padding:'.35rem .5rem',textAlign:'center',borderBottom:'1px solid var(--border)'}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {CHAIN.map(r=>(
                <tr key={r.strike} style={{background:r.atm?'rgba(124,109,255,.07)':'transparent'}}>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--green)'}}>{r.c_oi}</td>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--green)'}}>{r.c_vol}</td>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--green)'}}>{r.c_iv}</td>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--green)',fontWeight:r.atm?700:400}}>{r.c_ltp}</td>
                  <td style={{padding:'.45rem .75rem',textAlign:'center',fontWeight:700,color:r.atm?'var(--accent2)':'var(--text2)',background:'var(--surface2)',borderLeft:'2px solid var(--border2)',borderRight:'2px solid var(--border2)'}}>
                    {r.strike}{r.atm?' ★':''}
                  </td>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--red)',fontWeight:r.atm?700:400}}>{r.p_ltp}</td>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--red)'}}>{r.p_iv}</td>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--red)'}}>{r.p_vol}</td>
                  <td style={{padding:'.45rem .5rem',textAlign:'center',color:'var(--red)'}}>{r.p_oi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{fontSize:11,color:'var(--text3)',marginTop:'.75rem'}}>★ ATM — At The Money | OI — Open Interest | IV — Implied Volatility</p>
      </div>
    </div>
  )
}

export default Options
